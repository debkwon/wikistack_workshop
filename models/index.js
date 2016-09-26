var Sequelize = require('sequelize');
var db = new Sequelize('postgres://localhost:5432/wikistack',{ 
  logging: false});

var Page = db.define('page', {
  title: { type: Sequelize.STRING, allowNull: false },
  content: { type: Sequelize.TEXT, allowNull: false },
  status: { type: Sequelize.ENUM('open', 'closed'), defaultValue: 'closed' },
  date: { type: Sequelize.DATE, defaultValue: Sequelize.NOW },
  urlTitle: { type: Sequelize.TEXT, allowNull: false, isUrl: true },
  tags: {type: Sequelize.ARRAY(Sequelize.TEXT), isArray: true, defaultValue: []}  
},{
  getterMethods: { 
    url: function() { 
      var urlName = this.getDataValue('urlTitle');
      return this.getDataValue('/wiki/') + urlName;
    }
  } 
});

var User = db.define('user', {
  name: { type: Sequelize.STRING, allowNull: false },
  email: { type: Sequelize.TEXT, allowNull: false, isEmail: true }
});

var Tag = db.define('tag', {
  tagname: {type: Sequelize.STRING, allowNull: false}
});

Page.belongsTo(User, { as: 'author'});

function nameGen(title){
   if (title) {
    return title.replace(/\s+/g, '_').replace(/\W/g, '');
  } else {
    return Math.random().toString(36).substring(2, 7);
  }
}
Page.hook('beforeValidate', function(page) {
  page.urlTitle = nameGen(page.title);
})


module.exports = {
  Page: Page,
  User: User,
  db
};
