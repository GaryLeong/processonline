package com.careland.processonline.controller;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.RequestMapping;

@Controller
@RequestMapping(value = {"/hello"})
public class HelloController {
    @RequestMapping(value = {"/springboot"})
    public String hello() {
        return "HelloWord";
    }
}
