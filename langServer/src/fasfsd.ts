import OvsAPI from "ovsjs/src/OvsAPI.ts";

const a = 1;
(function(){return OvsAPI.createVNode('div',[
    '123',(
      function(){return OvsAPI.createVNode('div',[
        a,])})(),])})()
