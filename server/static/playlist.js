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
		//this.pointer2++; 
	}
	
	
	this.setPointToSong(song, ndeletedbefore){ //when updating playlist from sync: index.js stores what song was current before the update, then this function checks to see if that song is still in the playlist and if so sets the point to it; if it's not still in the playlist, it sets the pointer to the current pointer minus the number of songs deleted before the current pointer
		var exists=false;
		for (var i=0;i<this.plist.length;i++){ 
			if (this.plist[i].resourceid===song.resourceid && this.plist[i].orderi===song.orderi){ 
				this.pointer=i;
				exists=true;
			}
		}
		if (!exists){
			this.pointer = this.pointer-ndeletedbefore;
		}
		
	}
	
    this.append = function(song){
        //push to the end of the array list
        //song should be one of the source-agnostic song objects from index.js probably.
        this.plist.push(song);
		//console.log("appended to plist");
		//console.log(this.plist[0]);

        if(this.plist.length <= 1){
            //we added the first song.  Let the playing begin!
            ytLoadSong(this.plist[this.pointer].resourceid);
            this.pointer++;
        }
		this.plist = this.plist.filter(function(){return true;});
    }
	
	this.appendYTRID = function(resID) {
		this.plist.push(resID); 
		if (this.plist.length >= 1) { 
			ytCuePlaylist(this.plist); 
		}
        this.pl_changed();
	}
	
	this.addplistidx=function(j,s){
		this.plist[j]=s;
	}
	
	this.remove = function(song){ 
		this.plist = this.plist.filter(function(){return true;});
		console.log("in playlist: plist ");
		console.log(this.plist);
		console.log("in playlist: song ");
		console.log(this.song);
		for (var i=0;i<this.plist.length;i++){ //lol sorry i know there is a better way to do this i just dont know what it is rn
			if (this.plist[i].resourceid===song.resourceid && this.plist[i].orderi===song.orderi){ 
				this.plist.splice(i, 1);
			}
		}
        this.pl_changed();
		this.plist = this.plist.filter(function(){return true;});
	}
	
	this.deletewithhole = function(song){
		for (var i=0;i<this.plist.length;i++){
			if (this.plist[i].resourceid===song.resourceid && this.plist[i].orderi===song.orderi){ 
				delete this.plist[i];
			}
		}
	}d
	
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
		//console.log(plist);
		this.plist = this.plist.filter(function(){return true;});
    }
	
};