package com.careland.processonline.controller;

import com.careland.processonline.entity.MyUser;
import com.careland.processonline.service.UserLoginService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;
import org.springframework.util.StringUtils;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseBody;

import javax.servlet.http.HttpServletRequest;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * @author Administrator
 */
@Controller
@RequestMapping(value = {"/user"})
public class UserLoginController {

    /**
     * 最开始希望用Map的形式接参数，后来不用了，将请求对应的接受方式记录一下
     *
     * @RequestBody Map<String               ,               Object> map      post请求
     * @RequestParam Map<String               ,               Object> map     get请求
     */

    /**
     * 注入service
     */
    @Autowired
    private UserLoginService userLoginService;


    /**
     * 同时这个时候可以自己了解一下@Controller与@RestController的区别，以及@ResponseBody的用法。
     */

    /**
     * 跳转到用户登录页面
     *
     * @return 登录页面
     */
    @RequestMapping(value = {"/loginHtml"})
    public String loginHtml() {
        return "userLogin";
    }

    /**
     * 跳转到用户注册页面
     *
     * @return 注册页面
     */
    @RequestMapping(value = {"/registerpage"})
    public String registerpage() {
        return "register";
    }

    /**
     * 获取用户名与密码，用户登录
     *
     * @return 登录成功页面
     */
    @ResponseBody
    @RequestMapping(value = {"/userLogin"})
    public String userLogin(@RequestParam("username") String username,
                            @RequestParam("password") String password,
                            HttpServletRequest request) {

        if (StringUtils.isEmpty(username)) {
            return "用户名不能为空";
        }

        if (StringUtils.isEmpty(password)) {
            return "密码不能为空";
        }

        MyUser user = userLoginService.userLogin(username, password);

        //登录成功
        if (user != null) {
            //将用户信息放入session  用于后续的拦截器
            request.getSession().setAttribute("session_user", user);
            return "登录成功";
        }
        return "登录失败，用户名或密码错误";
    }

    /**
     * 注册新用户
     *
     * @return 注册结果
     */
    @ResponseBody
    @RequestMapping(value = {"/uregister"})
    public String addUser(@RequestParam("username") String username,
                          @RequestParam("password") String password,
                          @RequestParam("password2") String password2,
                          @RequestParam("age") int age) {
        if (StringUtils.isEmpty(username)) {
            return "用户名不能为空";
        }
        if (StringUtils.isEmpty(password)) {
            return "密码不能为空";
        }
        if (StringUtils.isEmpty(password2)) {
            return "确认密码不能为空";
        }
        if (!password.equals(password2)) {
            return "两次密码不相同，注册失败！！";
        } else {
            //int res = userLoginService.adduser(username, password, age);
            int res = userLoginService.addUser1(username, password, age);
            if (res == 0) {
                return "注册失败！";
            } else {
                return "注册成功！";
            }
        }
    }
}
