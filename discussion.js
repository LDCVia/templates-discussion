var xcontrols = {

 appVersion : '0.1',

 menuOptions : [

   { label : 'Languages', isSecondary : true, icon : 'fa-globe' ,
     menuOptions : [
       { label : 'Dutch', url : 'contacts-accordion.html'},
       { label : 'English', url : 'contacts-accordion.html'}
     ]
   },
   { label : 'Help', isSecondary : true, icon : 'fa-question-circle'},

   { label : 'Dashboard', url : 'index.html', icon : 'fa-dashboard' },
   { label : 'Lists', url : 'lists.html', icon : 'fa-list',
     menuOptions : [
       { label : 'All Documents', url : 'index.html', icon : 'fa-list-alt' },
       { label : 'By Category', url : 'bycategory.html', icon : 'fa-list-alt' }
     ]
   },

 ],

 footerOptions : [
   { label : 'All Documents', url : '/index.html', icon : 'fa-dashboard'},
   { label : 'By Category', url : '/bycategory.html', icon : 'fa-dashboard'}
 ],

 modelName : 'Topic',

 fields : [
   { label : 'Title' , field: 'title', required: true},
   { label : 'Category' , field: 'categories' },
   { label : 'Date Created' , field: 'datecreated' },
   { label : 'Body' , field: 'body' }
 ]

}
