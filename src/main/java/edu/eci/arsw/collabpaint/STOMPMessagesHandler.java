package edu.eci.arsw.collabpaint;

import java.util.ArrayList;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.CopyOnWriteArrayList;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.messaging.handler.annotation.DestinationVariable;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Controller;

import edu.eci.arsw.collabpaint.model.Point;
import javafx.scene.shape.Polygon;

@Controller
public class STOMPMessagesHandler {

    @Autowired
    SimpMessagingTemplate msgt;
    Map<String, CopyOnWriteArrayList<Point>> drawingPoints = new ConcurrentHashMap<>();

    @MessageMapping("/newpoint.{numdibujo}")
    public void handlePointEvent(Point pt,@DestinationVariable String numdibujo) throws Exception {
        System.out.println("Nuevo punto recibido en el servidor!:"+pt);
        CopyOnWriteArrayList<Point> points = drawingPoints.computeIfAbsent(numdibujo, k -> new CopyOnWriteArrayList<>());
        points.add(pt);
        msgt.convertAndSend("/topic/newpoint."+numdibujo, pt);
        if (points.size() >= 3) {
            msgt.convertAndSend("/topic/newpolygon." + numdibujo, points);
        }
    }
}