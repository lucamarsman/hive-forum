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


}

module.exports = Community;