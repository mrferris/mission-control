(function beacon_update() {
    $.ajax({
	dataType : 'json',
	url: "beacon_update",
	cache: false,
	success: function(json){
	    $(".telemetry").empty();

	    var i = 0;
	    for(key in json){
		if(json.hasOwnProperty(key)){

		    $(".telemetry").append("<p>"+key+": "+json[key]+"</p>");
		}
	    }
	    setTimeout(beacon_update,1);
	},
	error: function(json,string,opt){
	    alert("JSON: "+json);
	    alert("String: "+string);
	}
	
	});
})();



