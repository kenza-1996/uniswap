const { auth} = require('firebase-admin');
const { db, admin } = require('../util/admin');
exports.postGroup = (req, res) => {
  //if (req.body.clubName.trim() === '') {
    //  return res.status(400).json({ clubName: 'Body must not be empty' });
   // }
  const newGroup = {
      nomGroup: req.body.nomGroup,
      email: req.user.email,
      membres: req.body.membres,
      categorie: req.body.categorie,
      createdAt: admin.firestore.Timestamp.fromDate(new Date()),
      membresCount: 0,
      
  };
  db.doc(`/Groupes/${newGroup.nomGroup}`)
  .get()
  .then((doc) => {
    if (doc.exists) {
      console.log(newGroup.nomGroup);
      return res.status(400).json({ nomGroup: 'ce groupe existe deja' });
    }else{
        db.collection('Groupes').doc().set(newGroup);
        res.json({message : `document created successfully`});
     }

  })
  
  .catch((err) => {
      res.status(500).json({ error: `somthing went wrong` });
      console.error(err);

})
};

exports.getGroup =  (async (req , res) => {
    try{
        let document = db.collection('Groupes').doc(req.params.GroupId);
        let group = await document.get();
        if(group.exists){
            let response = group.data();
            return res.status(200).send(response);
        }
        else{
            return res.json({message: 'nom de groupe pas trouvé'});
        }
     }
    catch(err)  {
      res.status(500).json({ error: `somthing went wrong` });
        console.error(err);
}
});
exports.putGroup = (async(req, res)=>{
  try {
    const document = db.collection('Groupes').doc(req.params.GroupId);
    await document.update({
      nomGroup: req.body.nomGroup
    });
    return res.status(200).send();
  } catch (error) {
    res.status(500).json({ error: `somthing went wrong` });
        console.error(error);
  }
 
});
exports.deleteGroup = (async(req, res) => {
  
      try {
          const document = db.collection('Groupes').doc(req.params.GroupId);
          await document.delete();
          return res.status(200).send();
      } catch (error) {
          console.log(error);
          return res.status(500).send(error);
      }
      
  });