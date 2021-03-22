const { auth} = require('firebase-admin');
const { db, admin } = require('../util/admin');
const FieldValue = admin.firestore.FieldValue;
           


exports.postGroupes =(async(req, res) => {
  try {
    const{email, nom, groupName} = req.body;
    if(!email || !nom || !groupName) return res.status(422).send();
    const groupRef = await db.collection("Groupes").doc();

    const group =await groupRef.set({
      id: groupRef.id,
      name: groupName,
      email,
      membres: [{ id: email, name: nom, isAdmin: true }],
    });
    const response = await db.collection("users").doc(email)
    .update({
      groups: admin.firestore.FieldValue.arrayUnion({
        id: email,
        name: nom,
      }),
    });
    res.send(group);

  } catch (error) {
    console.log("error creating new group", error);
    res.status(400).send(error);
    
  }
});
exports.postMembres = (req, res) => {
                
              
    const membreDocument = db.doc(`/Groupes/${req.body.GroupId}`);
   
    let membreData ;
  
  
    membreDocument
      .get()
      .then((doc) => {
        if (doc.exists) {
          membreData = doc.data();
          membreData.membres.push(req.body.email && req.body.username);
          return membreDocument.update({ membres: membreData.membres });
          
          
          
        }  })
       
          

  
      .catch((err) => {
        console.error(err);
        res.status(500).json({ error: err.code });
      });
}
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
  exports.postPublication = (req,res) => {
    if (req.body.body.trim() === '') {
        return res.status(400).json({ body: 'Body must not be empty' });
      }
    const newPublication = {
        body: req.body.body,
        email: req.user.email,
        GroupId: req.params.GroupId,        
        likeCount:0,
        commentCount:0,
      
       createdAt: new Date().toISOString(),
       };
       console.log(newPublication);
  
    db.doc(`/Groupes/${req.params.GroupId}`)
      .get()
      .then((doc) => {
        if (!doc.exists) {
          return res.status(404).json({ error: 'publication not found' });
        }
        
      })
      .then(() => {
        return db.collection("Groupes").doc(req.params.GroupId).collection('publications').add(newPublication);
      })
      .then(() => {
        res.json(newPublication);
      })
        .catch((err) => {
            res.status(500).json({ error: `somthing went wrong` });
            console.error(err);

        });
}
exports.getAllPublications = (req, res) => {
  db.collection('Groupes').doc(req.params.GroupId).collection('publications')
    .orderBy('createdAt', 'desc')
    .get()
    .then((data) => {
      let publications = [];
      data.forEach((doc) => {
        publications.push({
          publicationId: doc.id,
          body: doc.data().body,
          email: doc.data().email,
          createdAt: doc.data().createdAt,
          commentCount: doc.data().commentCount,
          likeCount: doc.data().likeCount,
        //  userImage: doc.data().userImage
        });
      });
      return res.json(publications);
    })
    .catch((err) => {
      console.error(err);
      res.status(500).json({ error: err.code });
    });
};
exports.getPublication = (req, res) => {
    let publicationData = {};
    db.doc(`/Groupes/${req.params.GroupId}/publications/${req.params.publicationId}`)
      .get()
      .then((doc) => {
        if (!doc.exists) {
          return res.status(404).json({ error: 'publication n"est pas trouvé ' });
        }
        publicationData = doc.data();
        publicationData.publicationId = doc.id;
        return db
           .collection('Groupes').doc(req.params.GroupId).collection('commentaire')
          .orderBy('createdAt', 'desc')
          .where('publicationId', '==', req.params.publicationId)
          .get();
      })
      .then((data) => {
        publicationData.commentaire = [];
        data.forEach((doc) => {
          publicationData.commentaire.push(doc.data());
        });
        return res.json(publicationData);
      })
      .catch((err) => {
        console.error(err);
        res.status(500).json({ error: err.code });
      });
};
exports.commentOnPublication = (req, res) => {
  if (req.body.body.trim() === '')
    return res.status(400).json({ comment: 'Must not be empty' });

  const newCommentaire = {
    body: req.body.body,
    createdAt: new Date().toISOString(),
    publicationId: req.params.publicationId,
    email: req.user.email,
    
   // userImage: req.user.imageUrl,
    likeCount: 0,
    commentCount: 0
  };
  console.log(newCommentaire);

  db.doc(`/Groupes/${req.params.GroupId}/publications/${req.params.publicationId}`)
    .get()
    .then((doc) => {
      if (!doc.exists) {
        return res.status(404).json({ error: 'Scream not found' });
      }
      return doc.ref.update({ commentCount: doc.data().commentCount + 1 });
    })
    .then(() => {
      return db.collection('Groupes').doc(req.params.GroupId).collection('commentaire').add(newCommentaire);
    })
    .then(() => {
      res.json(newCommentaire);
    })
    .catch((err) => {
      console.log(err);
      res.status(500).json({ error: 'Something went wrong' });
    });
};
exports.likePublication = (req, res) => {
  const likeDocument = db
    .collection('Groupes').doc(req.params.GroupId).collection('like groupe')
    .where('email', '==', req.user.email)
    .where('publicationId', '==', req.params.publicationId)
    .limit(1);

  const publicationDocument = db.doc(`/Groupes/${req.params.GroupId}/publications/${req.params.publicationId}`);

  let publicationData;

  publicationDocument
    .get()
    .then((doc) => {
      if (doc.exists) {
        publicationData = doc.data();
        publicationData.publicationId = doc.id;
        return likeDocument.get();
      } else {
        return res.status(404).json({ error: 'Scream not found' });
      }
    })
    .then((data) => {
      if (data.empty) {
        return db
          .collection('Groupes').doc(req.params.GroupId).collection('like groupe')
          .add({
            publicationId: req.params.publicationId,
            email: req.user.email
          })
          .then(() => {
            publicationData.likeCount++;
            return publicationDocument.update({ likeCount: publicationData.likeCount });
          })
          .then(() => {
            return res.json(publicationData);
          });
      } else {
        return res.status(400).json({ error: 'Scream already liked' });
      }
    })
    .catch((err) => {
      console.error(err);
      res.status(500).json({ error: err.code });
    });
};
exports.unlikePublication = (req, res) => {
  const likeDocument = db
    .collection('Groupes').doc(req.params.GroupId).collection('like groupe')
    .where('email', '==', req.user.email)
    .where('publicationId', '==', req.params.publicationId)
    .limit(1);

  const publicationDocument = db.doc(`/Groupes/${req.params.GroupId}/publications/${req.params.publicationId}`);

  let publicationData;

  publicationDocument
    .get()
    .then((doc) => {
      if (doc.exists) {
        publicationData = doc.data();
        publicationData.publicationId = doc.id;
        return likeDocument.get();
      } else {
        return res.status(404).json({ error: 'Scream not found' });
      }
    })
    .then((data) => {
      if (data.empty) {
        return res.status(400).json({ error: 'Scream not liked' });
      } else {
        return db
          .doc(`/Groupes/${req.params.GroupId}/like groupe/${data.docs[0].id}`)
          .delete()
          .then(() => {
            publicationData.likeCount--;
            return publicationDocument.update({ likeCount: publicationData.likeCount });
          })
          .then(() => {
            res.json(publicationData);
          });
      }
    })
    .catch((err) => {
      console.error(err);
      res.status(500).json({ error: err.code });
    });
}; 
exports.deletePublication = (req, res) => {
  const document = db.doc(`/Groupes/${req.params.GroupId}/publications/${req.params.publicationId}`);
  document
    .get()
    .then((doc) => {
      if (!doc.exists) {
        return res.status(404).json({ error: 'Scream not found' });
      }
      if (doc.data().email !== req.user.email ) {
        return res.status(403).json({ error: 'Unauthorized' });
      } else {
        return document.delete();
      }
    })
    .then(() => {
      res.json({ message: 'Scream deleted successfully' });
    })
    .catch((err) => {
      console.error(err);
      return res.status(500).json({ error: err.code });
    });
};
