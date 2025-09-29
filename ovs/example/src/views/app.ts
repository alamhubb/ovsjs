import {hello} from "@/views/hello.ovs";

export const App = {
    components:{
    },
    render() {
        console.log(hello)
        return hello.render()
    }
};
