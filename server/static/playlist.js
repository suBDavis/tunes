var playlist = function(){
    this.plist = [];
    this.pointer = 0;
    this.disp = new pl_display();
    this.plid = "new";

    this.getNext = function(){
        //return the next song and increment the playlist pointer
        this.pointer+=1;
        return this.plist[this.pointer];
    }
    this.remove = function(songid){
        var copy = this.plist;
        var toRemoveI = 0;
        var toRemoveRID = null;
        this.plist = [];
        for(var i = 0;i<copy.length;i++){
            if (copy[i].songid == songid){
                toRemoveI = i;
                toRemoveRID = copy[i].resourceid;
            } else {
                this.plist.push(copy[i]);
            }
        }

        var params = "song_id="+toRemoveRID+"&index="+toRemoveI
        ajax_delete("/api/playlist/"+this.plid+"/song", params, function(text){
            console.log(text);
            var json_res = JSON.parse(text);
        });

        this.disp.update();
    }
    this.play = function(songid){
        //fuirst find where the song is in teh queue
    }
    this.append = function(song){

        if(!song.songid){
            song.songid = song.resourceid;
        }
        //push to the end of the array list
        //song should be one of the source-agnostic song objects from index.js probably.
        this.plist.push(song);

        var params = "type="+song.songtype+"&title="+song.songtitle+"&artist="+song.artist+"&song_id="+song.resourceid+"&index="+(this.plist.length-1)
        ajax_post("/api/playlist/"+this.plid+"/song", params, function(text){
            console.log(text);
            var json_res = JSON.parse(text);
            pl_manager.plid = json_res['plid'];
        });

        if(this.plist.length == 1){
            //we added the first song.  Let the playing begin!
            //Tell the player that we have a song, and let the player decide when to play it if it's ready
            uniplayer.setCurrentSong(song)

            uniplayer.loadSong();
            uniplayer.play();
        }
        
        this.disp.update();
    }
    this.localAdd= function(song){
        this.plist.push(song);
        if(this.plist.length == 1){
            //we added the first song.  Let the playing begin!
            //Tell the player that we have a song, and let the player decide when to play it if it's ready
            uniplayer.setCurrentSong(song)

            uniplayer.loadSong();
            uniplayer.play();
        }
        this.disp.update();
    }
    this.getAll = function(){
        return this.plist;
    }

    this.getCurrent = function(){
        return this.plist[this.pointer];
    }

    this.getPrevious = function(){
        //have to move pointer back 2 to the previous song.
        if(this.pointer == 0){
            return this.plist[0];
        } else {
            this.pointer-=1;
            return this.plist[this.pointer];
        }
    }
    this.load = function(){
        console.log(this.plid);
        if(this.plid != "new"){
            ajax("/api/playlist/" + this.plid , function(text){
                var reply = JSON.parse(text);
                var songarr = reply['pl_result'];
                for(var i =0;i<songarr.length;i++){
                    var s = songarr[i];
                    var db_song = new song(s['type'], s['guid'], s['resource_id'], s['artist'], s['title']);
                    pl_manager.append(db_song);
                }

            });
        }
    }
}

var pl_display = function(){
    this.pldiv = $("#playlist");
    //this.rmnode = "<a class='btn-floating waves-effect waves-light blue-grey darken-1 b-small remove'>X</a>";
    this.rmnode = "<a href='javascript:;' class='remove'><i class='fa fa-minus-circle fa-2x'></i></a>"
    //this.playnode = "<a class='btn-floating waves-effect waves-light blue-grey darken-1 b-small play'><i class='material-icons'>play_arrow</i></a>";
    this.playnode = "<a href='javascript:;' class='play'><i class='fa fa-play-circle fa-2x'></i></a>"
    this.update = function(){
        this.pldiv.empty();

        for(var i = 0; i < pl_manager.getAll().length;i++){
            var stitle = pl_manager.plist[i].songtitle;
            var sartist= pl_manager.plist[i].artist;
            var sid = pl_manager.plist[i].songid;
            var nodeTemplate = "<tr id='pl"+sid+"'><td>"+stitle+"</td><td>"+sartist+"</td><td>"+this.rmnode+"  "+this.playnode+"</td></tr>";
            this.pldiv.append(nodeTemplate);
        }
        $("#playlist .remove").on('click',function(e){
            var sid = $(e.target).closest("tr").attr("id");
            //trim off the first two chars.  we left these as "pl" in the list
            sid = sid.substring(2, sid.length);
            pl_manager.remove(sid);
        });
        $("#playlist .play").on('click',function(e){
            var sid = $(e.target).closest("tr").attr("id");
            //trim off the first two chars.  we left these as "pl" in the list
            sid = sid.substring(2, sid.length);
            pl_manager.play(sid);
        });
    }
}