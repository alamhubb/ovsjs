import OvsTokenConsumer from "./OvsConsumer.ts"
import {Subhuti, SubhutiRule} from 'subhuti/src/SubhutiParser.ts'
import OvsVueRenderFactory from "../factory/OvsVueRenderFactory.ts";
import SubhutiCst from "subhuti/src/struct/SubhutiCst.ts";
import SlimeParser from "slime-parser/src/language/es2025/SlimeParser.ts";

@Subhuti
export default class OvsParser extends SlimeParser<OvsTokenConsumer> {

}
