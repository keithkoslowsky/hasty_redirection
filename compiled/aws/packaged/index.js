const map = {"/foobar":{"redirect":"https://google.com","code":"301"},"/foobar2":{"redirect":"https://google.com","code":"302"},"/testing":{"redirect":"https://www.google.com","code":"301"},"/testing2":{"redirect":"https://www.google.com","code":"302"},"/":{"code":"301"}}

exports.handler = async (event) => {
    const path = (event.rawPath || '').trim()
    
    const statusCode = map[path] ? map[path]?.code || (map[path].html ? 200 : 301) : 404
    const headers = {
	...(map[path]?.redirect && { location: map[path].redirect }),
    }

    return {
        statusCode: statusCode,
	headers: headers,
    }
};
