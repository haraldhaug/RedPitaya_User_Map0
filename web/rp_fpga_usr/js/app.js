(function(APP, $, undefined) {
    
    // App configuration
    APP.config = {};
    APP.config.app_id = 'rp_fpga_usr';
    APP.config.app_url = '/bazaar?start=' + APP.config.app_id + '?' + location.search.substr(1);
    APP.config.socket_url = 'ws://' + window.location.hostname + ':9002';

    // WebSocket
    APP.ws = null;
    // Signal stack
    APP.signalStack = [];

    //LED state
    APP.led_state = false;
    APP.usr_in = "A";
    APP.spi_rg = 300;



    // Starts template application on server
    APP.startApp = function() {

        $.get(APP.config.app_url)
            .done(function(dresult) {
                if (dresult.status == 'OK') {
                    APP.connectWebSocket();
                } else if (dresult.status == 'ERROR') {
                    console.log(dresult.reason ? dresult.reason : 'Could not start the application (ERR1)');
                    APP.startApp();
                } else {
                    console.log('Could not start the application (ERR2)');
                    APP.startApp();
                }
            })
            .fail(function() {
                console.log('Could not start the application (ERR3)');
                APP.startApp();
            });
    };




    APP.connectWebSocket = function() {

        //Create WebSocket
        if (window.WebSocket) {
            APP.ws = new WebSocket(APP.config.socket_url);
            APP.ws.binaryType = "arraybuffer";
        } else if (window.MozWebSocket) {
            APP.ws = new MozWebSocket(APP.config.socket_url);
            APP.ws.binaryType = "arraybuffer";
        } else {
            console.log('Browser does not support WebSocket');
        }


        // Define WebSocket event listeners
        if (APP.ws) {

            APP.ws.onopen = function() {
                $('#status_message').text("Hg Pitaya connected!");
                console.log('Socket opened');   
            };

            APP.ws.onclose = function() {
                console.log('Socket closed');
            };

            APP.ws.onerror = function(ev) {
                $('#status_message').text("Connection error");
                console.log('Websocket error: ', ev);         
            };

            APP.ws.onmessage = function(ev) {
                console.log('Message recieved');
            };
        }
    };
    


}(window.APP = window.APP || {}, jQuery));




// Page onload event handler
$(function() {
    
    // Click
    $('#led_state').click(function() {

        if (APP.led_state == true)
        {
            $('#led_on').hide();
            $('#led_off').show();
            APP.led_state = false;
        }
        else
        {
            $('#led_off').hide();
            $('#led_on').show();
            APP.led_state = true;
        }
        var local = {};
        local['LED_STATE'] = { value: APP.led_state };
        APP.ws.send(JSON.stringify({ parameters: local }));
    });
    $("#usr_input").on("change input", function() {
        APP.usr_in = $('#usr_input').val();
        var local = {};
        local['USR_INPUT'] = { value: APP.usr_in };
        APP.ws.send(JSON.stringify({ parameters: local }));
	$('#input_msg').text(APP.usr_in);
    });
    $("#usr_range").on("change input", function() {
        APP.usr_rg = $('#usr_range').val();
        var local = {};
        local['USR_RANGE'] = { value: APP.usr_rg };
        APP.ws.send(JSON.stringify({ parameters: local }));        
        $('#range_msg').text(APP.usr_rg);
    });

    // Start application
    APP.startApp();
});
