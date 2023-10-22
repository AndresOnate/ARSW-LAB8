package edu.eci.arsw.collabpaint;


import edu.eci.arsw.collabpaint.model.Point;

import org.springframework.messaging.handler.annotation.DestinationVariable;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.SendTo;
import org.springframework.stereotype.Controller;

@Controller
public class CollabControler {

    @MessageMapping("/newpoint.{drawId}")
    @SendTo("/stompendpoint")
    public Point point(@DestinationVariable String drawId, Point message) throws Exception {
        return new Point(message.getX(), message.getY());
    }
}
