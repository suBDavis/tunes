var playlist = function(){
	this.plid=0; //starts at 0 
    this.plist = [];
    this.pointer = 0;
	this.pointer2 = 0; 

    this.getNext = function(){
        //return the next song and increment the playlist pointer
        var ret = this.plist[this.pointer+1];
        return ret;
    }
	
	this.getCurrent = function() { 
		return this.plist[this.pointer]; 
		this.pointer2++; 
	}
	
    this.append = function(song){
        //push to the end of the array list
        //song should be one of the source-agnostic song objects from index.js probably.
        this.plist.push(song);

        if(this.plist.length <= 1){
            //we added the first song.  Let the playing begin!
            ytLoadSong(this.plist[this.pointer]);
            this.pointer++;
        }
    }
	
	this.appendYTRID = function(resID) {
		this.plist.push(resID); 
		if (this.plist.length >= 1) { 
			ytCuePlaylist(this.plist); 
		}
        this.pl_changed();
	}
	
	this.remove = function(song){ 
		console.log("in playlist");
		console.log(this.plist);
		console.log(this.song);
		for (var i=0;i<this.plist.length;i++){ //lol sorry i know there is a better way to do this i just dont know what it is rn
			if (this.plist[i].resourceid===song.resourceid && this.plist[i].orderi===song.orderi){ 
				this.plist.splice(i, 1);
			}
		}
        this.pl_changed();
	}
	
	this.setplid = function(newplid){
		this.plid=newplid;
		console.log(this.plid);
	}
	
	this.new = function(plid){
		this.plist=[];
		this.pointer=0;
		this.plid=plid;
	}
	
	this.setlastorder = function(orderi){
		(this.plist[this.plist.length-1]).orderi(orderi);
	}

    this.pl_changed = function(){
        console.log("playlist was modified");
    }
	
};