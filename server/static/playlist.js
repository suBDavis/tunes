var playlist = function(){
    this.plist = [];
    this.pointer = 0;
    this.disp = new pl_display();

    this.getNext = function(){
        //return the next song and increment the playlist pointer
        return this.plist[this.pointer++];
    }
    this.append = function(song){
        //push to the end of the array list
        //song should be one of the source-agnostic song objects from index.js probably.
        this.plist.push(song);

        if(this.plist.length == 1){
            //we added the first song.  Let the playing begin!
            //Tell the player that we have a song, and let the player decide when to play it if it's ready
            uniplayer.loadSong();
            uniplayer.play();
        }
        this.disp.update();
    }
    this.getAll = function(){
        return this.plist;
    }
}

var pl_display = function(){
    this.pldiv = $("#playlist");

    this.update = function(){
        this.pldiv.empty();

        for(var i = 0; i < pl_manager.getAll().length;i++){
            var stitle = pl_manager.plist[i].songtitle;
            var sartist= pl_manager.plist[i].artist;
            var nodeTemplate = "<tr><td>"+stitle+"</td><td>"+sartist+"</td></tr>";
            this.pldiv.append(nodeTemplate);
        }
    }
}