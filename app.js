const Koa = require('koa')
const Router = require('koa-router')
const views = require('koa-views')
const bodyParser = require('koa-bodyparser')
const static = require('koa-static')

const path = require('path')
const fly = require('flyio')

const app = new Koa()
const router = new Router()


app.use(bodyParser())


app.use(static(
    path.join(__dirname, './static')
))

// 加载模板引擎
app.use(views(path.join(__dirname, './views'), {
    extension: 'ejs'
}))

app.use(async (ctx, next) => {
    console.log(`Process ${ctx.request.method} ${ctx.request.url}...`)
    await next()
});

router.get('/', async (ctx, next) => {
    await ctx.render('index')
    await next()
})

router.post('/submit', async (ctx, next) => {
    let errorMsg = {
        85004: '用户已经绑定了，请不要重复绑定',
        85001: '未找到用户，或者用户没有打开通过微信号搜索'
    }

    let postData = ctx.request.body
    console.log(postData)

    let url = 'http://www.busll.cn/rest/openwx/miniProgramBindTester'
    let data = {
        id: 10401,
        wechatid: postData.wechat_id
    }
    let result = {}
    try {
        let res = await fly.request(url, data, {
            method: 'POST',
            headers: {
                token: '61646D696E:1:1523092989776:C45897ED77CF4FC7354A297147C8219'
            }
        })
        console.log(res.data)
        if (res.data.errcode == 0) {
            result = {
                code: 0,
                message: '添加成功',
                desc: '请通知用户在二十四小时内同意邀请绑定'
            }
        } else {
            result = {
                code: res.data.errcode,
                message: '添加错误',
                desc: errorMsg[res.data.errcode]
            }
        }
    } catch (err) {
        console.log(err.status)
        console.log(err.message)
        result = {
            code: err.status,
            message: '系统错误',
            desc: `错误码:${err.status},错误描述：${err.message}, 请联系管理员`
        }
    }
    ctx.response.body = JSON.stringify(result)

    // await fly.request(url, data, {
    //     method: 'POST',
    //     headers: {
    //         token: '201:61646D696E:1:1523092989776:C45897ED77CF4FC7354A297147C8219E'
    //     }
    // }).then((res) => {
    //     let result
    //     console.log(res.data)
    //     if (res.data.errcode == 0) {
    //         result = {
    //             code: 0,
    //             message: '添加成功',
    //             desc: '请通知用户在二十四小时内同意邀请绑定'
    //         }
    //     } else {
    //         result = {
    //             code: res.data.errcode,
    //             message: '添加错误',
    //             desc: errorMsg[res.data.errcode]
    //         }
    //     }
    //     ctx.response.body = JSON.stringify(result)

    // }).catch(err => {
    //     console.log(err.status)
    //     console.log(err.message)
    //     let result = {
    //         code: err.status,
    //         message: '系统错误',
    //         desc: `错误码:${err.status},错误描述：${err.message}, 请联系管理员`
    //     }
    //     ctx.response.body = JSON.stringify(result);
    // })
    await next()
})


app.use(router.routes())
app.listen(8848)