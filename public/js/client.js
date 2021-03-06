$(window).on('load',function(){
    // $('#modalName').modal('show');
    window.Split(['#sidebar-left', '#main', '#sidebar-right'],
      {
        sizes: [20, 50, 30],
        minSize: 100
      });
    window.emojiPicker = new EmojiPicker({
      emojiable_selector: '[data-emojiable=true]',
      assetsPath: '/public/images',
      popupButtonClasses: 'fa fa-smile-o'
    });

    window.emojiPicker.discover();
    
    var addLi = (message) => {
      var source   = document.getElementById('text-template').innerHTML;
      var template = Handlebars.compile(source);
      var d = new Date(); 
      var time = d.toISOString();
      var context = {message: message, time: time};
      var html    = template(context);
 
      $('.list-unstyled').append(html);
    };
    
    var addFileLi = (file, type) => {
      var source   = document.getElementById('text-file-template').innerHTML;
      var template = Handlebars.compile(source);
      var d = new Date(); 
      var time = d.toISOString();
      var type = type.split('/')[0];
      var audio = false;
      var video = false;
      var image = false;
      if(type === "image")
        image = true;
      if(type === "audio")
        audio = true;
      if(type === "video")
        video = true;
      var context = {name: file.name, size: file.size, time: time, audio: audio, video: video, image: image};
      var html = template(context);
      $('.list-unstyled').append(html);
    };

    var socket = io.connect();

    $('#btn-chat').click((e) => {
      e.preventDefault();
      socket.emit('message sent', $('#btn-input').val());
    });

    $('.rooms-list li').click((e) => {
      e.preventDefault();
      var room = $(e.currentTarget).find("a").text();
      alert("welcome to "+room);
      socket.emit('join room', room);
    });

    socket.on('message received', (message) => addLi(message));
    socket.on('file received', (file, type) => addFileLi(file, type));
    var uploader = new SocketIOFileUpload(socket);
    //uploader.listenOnInput(document.getElementById("siofu_input"));
    var last_applied_change = null;
    var editor = ace.edit("editor");
    editor.setTheme("ace/theme/dracula");
    editor.getSession().setMode("ace/mode/javascript");
    
    editor.on('change', function (data) {
    if (last_applied_change != data)
      socket.emit('diff', JSON.stringify(data));
    });
   
    socket.on('patch', (diff) => {
    diff = JSON.parse( diff ) ;
    last_applied_change = diff;
    editor.getSession().getDocument().applyDeltas( [diff] );
    });

    $('#sidebar-right').on("resize", function() { 
      console.log("resize sidebar");
      editor.resize();
    });
});