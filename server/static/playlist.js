var playlist = function(){
    this.plist = [];
    this.pointer = 0;

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
            ytLoadSong(this.plist[this.pointer]);
            this.pointer++;
        }
    }
}