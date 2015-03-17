var headers = {'headers':
   {
     'apikey': null
   }
};

xcomponents.appVersion = '0.1';
xcomponents.host = 'https://beta.ldcvia.com/1.0';
xcomponents.db = 'dev-londc-com-discussion-nsf';
xcomponents.loginurl = xcomponents.host + "/login";
xcomponents.listurl = xcomponents.host + '/collections/' + xcomponents.db + '/MainTopic';
xcomponents.docurl = xcomponents.host + '/document/' + xcomponents.db + '/MainTopic/:id';

xcomponents.menuOptions = [
  { label : 'Logout', isSecondary : true, icon : 'fa-sign-out', logout: true},
  { label : 'All Documents', url : 'index.html', icon : 'fa-dashboard' }
];

xcomponents.footerOptions = [
  { label : 'All Documents', url : '/index.html', icon : 'fa-dashboard'}
];

xcomponents.modelName = 'Topic';

xcomponents.fields = [
  { label : 'Subject' , field: 'Subject', required: true},
  { label : 'Created By' , field: 'From', type: 'notesname', edit: false },
  { label : 'Category' , field: 'Categories', type: 'implodelist', read: true, edit: false },
  { label : 'Category' , field: 'Categories', type: 'select-multiple', options: ['Design', 'Development', 'Manufacturing', 'Sales'], read: false, edit: true },
  { label : 'Date Created' , field: '__created', type: 'date', edit: false },
  { label : 'Body' , field: 'Body__parsed', type: 'html', read: true, edit: false},
  { label : 'Body' , field: 'Body__parsed', type: 'html', read: false, edit: true},
  { label : 'Files', field: '_files', type: 'files', read: true, edit: false},
  { label : '', field: 'file', type: 'files', read: false, edit: true}
];
