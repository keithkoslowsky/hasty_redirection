const map = {}

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
