var admin = require("firebase-admin");

var serviceAccount = require("C:\\Users\\Nikesh\\Downloads\\firebaseConfig.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://logger-707b8.firebaseio.com"
});

var AuthAPI = {

    checkUserInput : async function(req,res){
        let uid = req.header('Authorization');
        try{
            let decodedTocken = await admin.auth().verifyIdToken(uid)
            if(decodedTocken==null)
                return false;
            else
                return decodedTocken.uid;
        }catch(err){
            console.log("error authenticating user: " + err)
        }
        return false;

    }

}


module.exports = AuthAPI;