// Async/Await
async function fetchData() {
    const response = await fetch('/api')
    const data = await response.json()
    return data
}

const getData = async () => {
    try {
        const result = await fetchData()
        return result
    } catch (e) {
        console.error(e)
    }

}


