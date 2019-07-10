package com.careland.processonline.controller;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.RequestMapping;

/**
 * @author Administrator
 */
@Controller
@RequestMapping(value = {"/map"})
public class MapController {
    @RequestMapping(value = {"/index"})
    public String index() {
        return "map/mapindex";
    }

    @RequestMapping(value = {"/index1"})
    public String index1() {
        return "map/mapindex1";
    }

    @RequestMapping(value = {"/locationPage"})
    public String locationPage() {
        return "map/locationPage";
    }
}
