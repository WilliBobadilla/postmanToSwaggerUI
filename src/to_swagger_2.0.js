const JSON5 = require('json5')


module.exports = (collection, config) => {

  const output = {}

  // swagger version
  output.swagger = "2.0"

  // info object
  output.info = {}
  output.info.title = (config.info && config.info.name)
    ? config.info.name : (collection.info.name || "")
  output.info.description = (config.info && config.info.description)
    ? config.info.description : (collection.info.description || "No description")
  output.info.version = (config.info && config.info.version)
    ? config.info.version : process.env.npm_package_version

  // host
  // output.host = (config.host) ? config.host : mostPopularHost(collection)
  if (config.host) output.host = config.host

  // basepath
  if (config.basepath) output.basepath = config.basepath

  // schemes
  output.schemes = (config.schemes) ? config.schemes : ['https']

  // consumes
  if (config.consumes) {
    output.consumes = config.consumes
  }

  // produces
  if (config.produces) {
    output.produces = config.produces
  }

  // paths
  output.paths = getPaths(collection, config)

  return output
}

const getPaths = (collection, config) => {
  let result = {}

  let allItems = collection.item
    .map(grouping => grouping.item ? grouping.item : grouping)
    .flat(1)
    .forEach(item => {
      let path = `/${item.request.url.path.join('/')}`
        .replace(/{{/g, '{')
        .replace(/}}/g, '}')
      console.log("path", path)
      console.log(typeof path)
      //replace the : for {}, ex: get/:var -> get/{var}
      if (path.indexOf(":") >= 0) {
        var arrayOfPath = path.split('/')
        //arrayOfPath.map()
        console.log("-----array of paht ")
        console.log(arrayOfPath);
        arrayOfPath.forEach(function (arrItem) {
          var pathVar = "";
          if (arrItem.indexOf(":") >= 0) {
            pathVar = arrItem.substr(1, arrItem.length);
            console.log("the name is: " + pathVar);
            path = path.replace(arrItem, "{" + pathVar + "}")
          }

        })
        //const reg = /:\(?(\w+)\)?/g
        //path = path.replace(reg, "{variable}");
        console.log("new path is: " + path);
      }
      result[path] = result[path] || {}
      //console.log(result);
      // each method (GET, POST, PUT, DELETE) for path
      console.log("method" + item.request.method.toLowerCase())
      result[path][item.request.method.toLowerCase()] = {

        summary: item.name,
        description: "Add your description here",
        // parameter types: [query, path, header, body, form]
        parameters: getParameters(
          item.request.header,
          item.request.body,
          item.request.url,
          config
        ),

        responses: getResponses(item.response, config)
      }
    })

  return result
}


const getParameters = (header, body, url, config) => {
  result = []
  result.push(processReqHeader(header, config))
  result.push(processReqBody(body, config))
  result.push(processReqPath(url, config))
  result.push(processReqQuery(url, config))

  return result.flat(1)
}


const processReqHeader = (header, config) => {
  let result
  result = header.map(object => {
    // early exit if omitted
    if (config.omit) {
      if (config.omit.headers.indexOf(object.key) !== -1) {
        return null
      }
    }

    let result = {}
    result.in = "header"
    result.name = object.key
    if (config.require_all) {
      if (config.require_all.indexOf("headers") !== -1) result.required = true
    }
    result.type = "string"
    return result
  }).filter(x => x)

  return result
}


const processReqBody = (body, config) => {
  let result = {}
  let parsedBody, parsedBodyKeys
  if (!body || !body.raw) {
    return []
  }

  try {
    parsedBody = JSON5.parse(body.raw)
    parsedBodyKeys = Object.keys(parsedBody)
  }
  catch (err) {
    console.error(err)
    console.log(body.raw)

    throw new Error(`Request body must be array or object, instead got: ${body}`)
  }

  result.in = "body"
  result.name = (parsedBodyKeys.length === 1) ? parsedBodyKeys[0] : "body"
  result.schema = bodyItemToSwagger(parsedBody, config)
  if (config.require_all.indexOf("body") !== -1) result.required = true
  return result
}


const processReqQuery = (url, config) => {
  let result
  if (!url.query || !url.query.length) return []

  result = url.query.map(query => {
    let result = {}
    result.in = 'query'
    result.name = query.key
    result.type = typeof query.value
    if (config.require_all) {
      if (config.require_all.indexOf("query") !== -1) result.required = true
    }
    return result
  })

  return result
}


const processReqPath = (url, config) => {
  let result
  if (url.path.length === 1) return []
  //console.log(url.path)
  // clone && remove first element because its never a slug
  let paths = url.path.slice(1)
  //result.required = false;
  result = paths.map(path => {
    //verify for :var
    let result = {}
    if (path.indexOf(':') >= 0) {
      result.in = 'path'
      result.name = path.match(/:\(?(\w+)\)?/g)[0].substring(1)
      result.type = typeof result.name
      result.required = false;
    } else {//verify for {{variable}}
      if (path.indexOf('{{') === -1) return null
      result.in = 'path'
      result.name = path.match(/{{(.*)}}/)[1]
      result.type = typeof result.name
      result.required = false
    }
    if (config.require_all.indexOf("path") !== -1) result.required = true
    return result
  }).filter(x => x)

  return result
}


const bodyItemToSwagger = (value, config) => {
  let result
  let type = (Array.isArray(value)) ? "array" : typeof value

  switch (type) {
    case ("array"):
      result = {
        type: "array",
        items: {
          type: (typeof value[0] === 'number') ? "number" : "string"
        }
      }
      break

    case ("object"):
      result = {
        type: "object",
        properties: {}
      }
      if (value) {
        Object.entries(value)
          .forEach(arr => { result.properties[arr[0]] = bodyItemToSwagger(arr[1], config) })
      }
      break

    case "number":
    case "string":
    case "boolean":
      result = {
        type: type
      }
      break

    default:
      throw new Error(`Type ${type} not supported`)
  }

  return result
}


const getResponses = (responses, config) => {
  if (!responses.length) return config.responses ? config.responses : []

  let result = {}
  responses.forEach(response => {
    result[response.code] = { description: response.status }
  })
  return result
}
