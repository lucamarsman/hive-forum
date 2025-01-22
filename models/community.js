const queryDb = require('../utils/queryDb.js'); // import queryDb
const jwt_decode = require("jwt-decode"); // import jwt_decode

//TODO: implement community create backend logic render them to the communities list page
// Handle community join logic
// Handle rendering and creation of posts when in specific community
class Community {
    //Add creator as a member in communitymemberships table on creation
    static async createCommunity(req, res) { // create post
        if(res.authenticated){ // if user is authenticated
            const payload = { 
                "title": req.body.post_title, 
                "description": req.body.post_body, 
                "createdAt": new Date(new Date().getTime())
            }

            const defaultLogoPath ="/public/assets/images/defaultCommunityLogo.svg";

            let decodedToken = jwt_decode(req.cookies['refresh-token']) // decode JWT token
            const uid = decodedToken.user.userid; // get user ID from decoded JWT token
            let result;
            if(req.file){
                result = await queryDb('INSERT INTO Communities (name, description, created_at, created_by, logo_path) VALUES (?,?,?,?,?)', [payload.title, payload.description, payload.createdAt, uid, req.file.path]); 
            }else{
                result = await queryDb('INSERT INTO Communities (name, description, created_at, created_by, logo_path) VALUES (?,?,?,?,?)', [payload.title, payload.description, payload.createdAt, uid, defaultLogoPath]); 
            }
            
            const insertedId = result.insertId;
            const community = await queryDb('SELECT name FROM Communities WHERE id = ?', [insertedId]);

            // Add owner to membership table
            await queryDb("INSERT INTO CommunitiesMemberships (user_id, community_id, role, joined_at) VALUES (?,?,?,?)", [uid, insertedId, "moderator", payload.createdAt]);

            res.redirect(`/communities/${community[0].name}`);
        }else{ // if user is not authenticated
            res.redirect('/login'); // redirect to login page
        }
        
    }

    static async fetchCommunityDetails(req, res) {
        const communityName = req.params.communityName;
        const details = await queryDb("SELECT * FROM Communities WHERE name = ?", [communityName]);
        res.json(details);
    }

    static async fetchCommunityDetailsViaId(req, res) {
        const communityId = req.params.communityId;
        const details = await queryDb("SELECT * FROM Communities WHERE id = ?", [communityId]);
        res.json(details);
    }

    static async fetchCommunities(req, res){
        const limit = 5; // number of communities per page
        const page = req.query.page ? parseInt(req.query.page) : 1; // get page number from request query
        const offset = (page - 1) * limit; // calculate offset

        try{
            const communities = await queryDb(`SELECT name, logo_path, description FROM Communities LIMIT ? OFFSET ?`, [ limit, offset]);
            res.json(communities); // return posts as JSON
        }catch(error){
            console.error("Error fetching communities:", error);
            res.status(500).json({ error: "An error occurred while fetching communities" });
        }
    }

    static async searchCommunities(req, res){
        const searchVal = `%${req.query.query}%`; // get search query from request query
        const limit = 5; // number of posts per page
        const page = req.query.page ? parseInt(req.query.page) : 1; 
        const offset = (page - 1) * limit; 

        try{
            const communities = await queryDb(`SELECT name, logo_path, description FROM Communities WHERE name LIKE ? LIMIT ? OFFSET ?`, [searchVal, limit, offset]);
            console.log('Communities fetched:', communities);
            res.json(communities); // return posts as JSON
        }catch(error){
            console.error("Error fetching communities:", error);
            res.status(500).json({ error: "An error occurred while fetching communities" });
        }
    }

    static async joinCommunity(req, res){
        if(res.authenticated){
            try{
                const communityName = req.query.community;
                const communityResult = await queryDb("SELECT id FROM Communities WHERE name = ?", [communityName]);
                const communityId = communityResult[0].id;

                let decodedToken = jwt_decode(req.cookies['refresh-token']) // decode JWT token
                const uid = decodedToken.user.userid; // get user ID from decoded JWT token

                await queryDb("INSERT INTO CommunityMemberships (user_id, community_id, role, joined_at) VALUES (?,?,?,?)", [uid, communityId, "member", new Date(new Date().getTime())]);
                return res.sendStatus(200);
            }catch(error){
                console.log(error);
                return res.sendStatus(500);
            }
        }else{
            return res.sendStatus(401);
        }
    }

    static async leaveCommunity(req, res){
        if(res.authenticated){
            try{
                const communityName = req.query.community;
                const communityResult = await queryDb("SELECT id FROM Communities WHERE name = ?", [communityName]);
                const communityId = communityResult[0].id;

                let decodedToken = jwt_decode(req.cookies['refresh-token']) // decode JWT token
                const uid = decodedToken.user.userid; // get user ID from decoded JWT token

                await queryDb("DELETE FROM CommunityMemberships WHERE user_id = ? AND community_id = ?", [uid, communityId]);
                res.sendStatus(200);
            }catch(error){
                console.log(error);
                res.sendStatus(500);
            }
        }else{
            return res.sendStatus(401);
        }
    }

    static async checkMembership(req, res){
        if(res.authenticated){
            try{
                const communityName = req.params.communityName;
                const communityResult = await queryDb("SELECT id FROM Communities WHERE name = ?", [communityName]);
                const communityId = communityResult[0].id;

                let decodedToken = jwt_decode(req.cookies['refresh-token']) // decode JWT token
                const uid = decodedToken.user.userid; // get user ID from decoded JWT token

                const isMember = await queryDb("SELECT * FROM CommunityMemberships WHERE user_id = ? AND community_id = ?", [uid, communityId]);
                console.log("isMEMBER: " + isMember);
                if(isMember.length > 0){
                    return res.sendStatus(200);
                }
                return res.sendStatus(403);
            }catch(error){
                console.log(error);
                return res.sendStatus(500);
            }
        }else{
            return res.sendStatus(403);
        }
    }

    static async getCommunityStats(req, res){
        const communityName = req.params.communityName;
        const communityResult = await queryDb("SELECT id FROM Communities WHERE name = ?", [communityName]);
        const communityId = communityResult[0].id;

        const memberCountResult = await queryDb("SELECT COUNT(*) AS total_members FROM CommunityMemberships WHERE community_id = ?", [communityId]);
        const memberCount = memberCountResult[0].total_members;

        res.json(memberCount)
    }

    static async getPopular(req, res) {
        try {
            const query = `
                SELECT 
                    c.id, 
                    c.name, 
                    c.description, 
                    c.logo_path, 
                    COUNT(cm.user_id) AS member_count
                FROM 
                    Communities c
                INNER JOIN 
                    CommunityMemberships cm
                ON 
                    c.id = cm.community_id
                GROUP BY 
                    c.id, c.name, c.description, c.logo_path
                ORDER BY 
                    member_count DESC
                LIMIT 10;
            `;
            const results = await queryDb(query);
            res.status(200).json(results);
        } catch (error) {
            console.error("Error fetching popular communities:", error);
            res.status(500).json({ error: "An error occurred while fetching popular communities." });
        }
    }
    
    static async getLogo(req, res) {
        try{
            const results = await queryDb(`SELECT logo_path FROM Communities WHERE name = ?`, [req.params.communityName]);
            res.status(200).json(results);
        }catch(error){
            res.status(500).json({msg: "Something went terribly wrong: " + error});
        }
    }

}

module.exports = Community;