var discord = require('../helpers/discord')

server.post('/comments/new', (req, res, next) => {
  if (!req.user || !req.body.wagoID || !req.body.text) {
    return res.send(403, {error: "forbidden"})
  }

  WagoItem.findById(req.body.wagoID).populate('_userId').then((wago) => {
    if (!wago) {
      return res.send(404, {error: "no_wago"})
    }

    wago.popularity.comments_count++
    wago.last_comment = Date.now()
    wago.save()

    var comment = {
      wagoID: req.body.wagoID,
      authorID: req.user._id,
      commentText: req.body.text,
      postDate: Date.now()
    }

    var tagged = []

    if (wago._userId && wago._userId._id && !wago._userId._id.equals(req.user._id)) {
      tagged.push({userID: wago._userId._id})
      comment.commentText = comment.commentText.replace('@' + wago._userId.profile.name, '[taggeduser]@' + wago._userId.profile.name + '[/taggeduser]')
      discord.onComment(req.user, wago._userId, wago)
    }

    var re = /@([^.,\/@#!$%\^&\*;:{}=`~()\s\[\]]+)/g
    mentions = []
    while ((m = re.exec(comment.commentText)) !== null) {
      mentions.push(m[1])
    }

    async.eachOf(mentions, (username, key, cb) => {
      User.findByUsername(username).then((user) => {
        if (!user || (wago._userId && wago._userId._id && wago._userId._id.equals(user._id))) {
          return cb()
        }
        else {
          comment.commentText = comment.commentText.replace('@' + user.profile.name, '[taggeduser]@' + user.profile.name + '[/taggeduser]')
          tagged.push({userID: user._id})
          discord.onComment(req.user, user, wago)
          return cb()
        }
      })
    }, () => {
      comment.usersTagged = tagged
      new Comments(comment).save().then((doc) => {
        var c = [{ 
          cid: doc._id,
          date: Date.now(),
          text: doc.commentText,
          format: 'bbcode',
          canMod: true,
          author: {
            name: req.user.profile.name,
            avatar: req.user.avatarURL,
            class: req.user.roleclass,
            profile: req.user.profile.url,
            enableLinks: req.user.account.verified_human            
          }
        }]
        res.send(c)
      })
    })
  })
})

server.post('/comments/delete', (req, res) => {
  if (!req.user || !req.body.comment) {
    return res.send(403, {error: "forbidden"})
  }

  Comments.findById(req.body.comment).then((comment) => {
    // if comment is on user's wago then allow delete
    WagoItem.findById(comment.wagoID).then((wago) => {      
      // if user is moderator, comment author or wago owner then allow delete
      if ((req.user.admin && (req.user.admin.super || req.user.admin.moderator)) || (req.user._id.equals(comment.authorID)) || (req.user._id.equals(wago._userId))) {
        wago.popularity.comments_count--
        wago.save()
        comment.remove()
        return res.send({success: true})
      }

      else {
        return res.send(403, {error: "forbidden"})
      }
    })
  })
})

server.post('/comments/clear', (req, res) => {
  if (!req.user || !req.user.unreadMentions || !req.body.comment) {
    return res.send(403, {error: "forbidden"})
  }

  Comments.findById(req.body.comment).then((comment) => {
    comment.usersTagged.forEach((tag, i) => {
      if (tag.userID.equals(req.user._id) && !tag.read) {
        comment.usersTagged[i].read = true
        comment.save().then((doc) => {
          res.send({success: true})
        })
      }
    })
  })
})