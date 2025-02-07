const View = require('../models/view.js'); // import view model

exports.renderLogin = async (req, res) => { // render login page
    res.render('login.ejs');
};

exports.renderRegister = async (req, res) => { // render register page
    const token = req.query.token;
    if (token) {
        View.renderRegisterConfirm(req, res)
    } else {
        View.renderRegisterForm(req, res)
    }
};

exports.renderHomepage = async (req, res) => { // render homepage
    try{
        res.render('index.ejs');
    }catch(error){
        console.log(error)
    }
};

exports.renderPostSubmit = async (req, res) => { // render post submit page
    if(res.authenticated){
        res.render('post-submit.ejs');
    }else{
        res.redirect("/login");
    }
};

exports.renderReset = async (req, res) => { // render reset page
    res.render('reset.ejs');
};

exports.renderResetLink= async (req, res) => { // render reset link page
    res.render('reset-link.ejs');
};

exports.viewProfile= async (req, res) => { // view profile
    try {
        View.viewProfile(req, res);
    } catch (error) {
        console.log("Something went wrong", error);
        // Handle the error appropriately
    }
};

exports.viewUser= async (req, res) => { // view user
    try {
        View.viewUser(req, res);
    } catch (error) {
        console.log("Something went wrong", error);
        // Handle the error appropriately
    }
};

exports.viewPost= async (req, res) => { // view post
    if(res.authenticated){
        res.render('post-view-a.ejs');
    }else{
        res.render('post-view.ejs');
    }
};

exports.getPostData= async (req, res) => { // view post
    try{
        View.viewPost(req, res)
    }catch(error){
        console.log(error)
    }
};

exports.saveChanges= async (req, res) => { // view post
    try{
        View.saveChanges(req, res)
    }catch(error){
        console.log(error)
    }
};

exports.deletePost= async (req, res) => { // view post
    try{
        View.deletePost(req, res)
    }catch(error){
        console.log(error)
    }
};


exports.getUserImage= async (req, res) => { // get user image
    try {
        View.getUserImage(req, res);
    } catch (error) {
        console.log("Something went wrong", error);
        // Handle the error appropriately
    }
};

exports.renderCommunityPage = async (req, res) => {
    res.render('communities.ejs');
}

exports.renderCommunityCreatePage = async (req, res) => {
    if(res.authenticated){
        res.render('community-create.ejs');
    }else{
        res.redirect("/login");
    }
}

exports.renderCommunity = async (req, res) => {
    res.render('communityView.ejs');
}

exports.renderCommunityNewPost = async (req, res) => {
    res.render('communityNewPost.ejs');
}


