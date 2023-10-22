var app = (function () {

    class Point{
        constructor(x,y){
            this.x=x;
            this.y=y;
        }        
    }
    
    var stompClient = null;
    var drawId = null;

    var addPointToCanvas = function (point) {        
        var canvas = document.getElementById("canvas");
        var ctx = canvas.getContext("2d");
        ctx.beginPath();
        ctx.arc(point.x, point.y, 3, 0, 2 * Math.PI);
        ctx.stroke();
    };
    
    
    var getMousePosition = function (evt) {
        canvas = document.getElementById("canvas");
        var rect = canvas.getBoundingClientRect();
        return {
            x: evt.clientX - rect.left,
            y: evt.clientY - rect.top
        };
    };

    var  drawPolygon = function(points) {
        var canvas = document.getElementById("canvas");
        var ctx = canvas.getContext("2d");
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.beginPath();
        ctx.moveTo(points[0].x, points[0].y);
        for (var i = 1; i < points.length; i++) {
            ctx.lineTo(points[i].x, points[i].y);
        }
        ctx.closePath();
        ctx.fillStyle = "rgba(0, 0, 255, 0.5)";
        ctx.fill();
        ctx.strokeStyle = "blue";
        ctx.lineWidth = 2;
        ctx.stroke();
    };


    var connectAndSubscribe = function (drawId) {
        console.info('Connecting to WS...');
        var socket = new SockJS('/stompendpoint');
        stompClient = Stomp.over(socket);
        
        //subscribe to /topic/TOPICXX when connections succeed
        stompClient.connect({}, function (frame) {
            console.log('Connected: ' + frame);
            var topic = '/topic/newpoint.' + drawId;
            stompClient.subscribe(topic, function (eventbody) {
                var pointData = JSON.parse(eventbody.body);
                var x = pointData.x;
                var y = pointData.y;
                var point = new Point(x, y);
                addPointToCanvas(point);
            });
            stompClient.subscribe('/topic/newpolygon.'+ drawId, function (eventbody) {
                var polygonData = JSON.parse(eventbody.body);
                drawPolygon(polygonData);
            });
        });

    };
    
    

    return {

        init: function () {
            var can = document.getElementById("canvas");
            document.getElementById("connectButton").addEventListener("click", function () {
                var ctx = can.getContext("2d");
                ctx.clearRect(0, 0, canvas.width, canvas.height);
                drawId = document.getElementById("drawId").value;
                connectAndSubscribe(drawId);
            });
            var offset;
            if(window.PointerEvent) {
                can.addEventListener("pointerdown", function(event){
                    offset  = getMousePosition(event);
                    app.publishPoint(offset.x,offset.y);
                });
            } else {
                canvas.addEventListener("mousedown", function(event){
                    offset  = getMousePosition(event);
                    app.publishPoint(offset.x,offset.y);
                    
                });
        
            }
        },

        publishPoint: function(px,py){
            var pt=new Point(px,py);
            console.info("publishing point at "+pt);
            addPointToCanvas(pt);
            var topic = '/app/newpoint.' + drawId;
            stompClient.send(topic, {}, JSON.stringify(pt)); 

            //publicar el evento
        },

        disconnect: function () {
            if (stompClient !== null) {
                stompClient.disconnect();
            }
            setConnected(false);
            console.log("Disconnected");
        }
    };

})();