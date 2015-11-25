var playlist = function(){
    this.plist = [];
    this.pointer = 0;

    this.getNext = function(){
        return this.plist[this.pointer]
        this.pointer++;
    }
    this.append = function(songid){
        this.plist.push(songid);

        if(this.plist.length == 1){
            //we added the first song.  Let the playing begin!
            ytLoadSong(this.plist[this.pointer]);
            this.pointer++;
        }
    }
}