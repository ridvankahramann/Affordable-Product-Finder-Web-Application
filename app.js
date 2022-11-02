const app = require('express')();
const http = require('http').Server(app);
const io = require('socket.io')(http);
const createBrowserless = require('browserless')
const getHTML = require('html-get')
const cheerio = require('cheerio')

var myJSON = [];

app.get("/", function (req, res) {
  res.sendFile("index.html", {root: __dirname})
})

http.listen(3000, function () {
  console.log('listenting on 3000')
})

io.sockets.on('connection', function (socket) {
    socket.on('url', function (msg) {
      getContent(msg).then(content => {
        const $ = cheerio.load(content.html)
        getContent($('.pw_v8').attr("href"))
        .then(content => {
          myJSON = []
          const $ = cheerio.load(content.html)
          $('a').each(function () {
            var class_ = $(this).attr("class")
            var url = "https://www.akakce.com/" + $(this).attr("href");
            if(class_ == "iC xt_v8"){ $(this).attr("href", url) }
            if($(this).find('span .pt_v8').text() != ''){
              myJSON.push({price:$(this).find('span .pt_v8').text(),url:url});
            }
          })
          return io.send('message', myJSON)
        })
        .catch(error => {
          console.error(error)
        })
      })
    })
})

const browserlessFactory = createBrowserless()
const getContent = async url => {
  const browserContext = browserlessFactory.createContext()
  const getBrowserless = () => browserContext
  const result = await getHTML(url, { getBrowserless })
  await getBrowserless((browser) => browser.destroyContext())
  return result
}