import SubhutiCst from "subhuti/src/struct/SubhutiCst.ts";

export default class OvsVueRenderAst {
    slotName: string
    component: SubhutiCst
    props: SubhutiCst[]
    OvsChildList: SubhutiCst
}
