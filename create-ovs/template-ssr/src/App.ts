/**
 * App 组件 - 纯 OVS 实现
 * SSR 兼容版本
 */
import { defineOvsComponent, $OvsHtmlTag } from 'ovsjs'
import HelloWorld from './components/HelloWorld.ovs'

export default defineOvsComponent(() => {
    return $OvsHtmlTag.div({ class: 'app' }, [
        $OvsHtmlTag.header({}, [
            $OvsHtmlTag.img({
                alt: 'Vue logo',
                class: 'logo',
                src: '/assets/logo.png',
                width: 125,
                height: 125
            }),
            $OvsHtmlTag.div({ class: 'wrapper' }, [
                HelloWorld
            ])
        ])
    ])
})

