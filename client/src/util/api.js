export async function fetchGet(url, token) {
    let data;
    let pagination;
    let status;

    try {
        const response = await fetch(url, {
            credentials: "include",
            method: "GET",
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });

        status = response.status;

        const result = await response.json();
        data = result.data;
        pagination = result.pagination;
    } catch (error) {
        console.error(error);
    }

    return { data, status, pagination };
}

export async function fetchPost(url, body, token) {
    let status = 0;
    let data;
    try {
        const response = await fetch(url, {
            method: "POST",
            credentials: "include",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`,
            },
            body: JSON.stringify(body),
        });

        status = response.status;
        data = await response.json();
        
        if (!response.ok) {
            console.error(`HTTP error! Status: ${status}`);
            return { status, data };
        }

        return { status, data };
    } catch (error) {
        console.error("Fetch error:", error);
        return { status, error: error.toString() };
    }
}

export async function fetchPatch(url, body, token) {
    let status = 0;
    try {
        const isFormData = body instanceof FormData;

        const headers = {
            "Authorization": `Bearer ${token}`
        };

        if (!isFormData) {
            headers["Content-Type"] = "application/json";
        }

        const response = await fetch(url, {
            method: "PATCH",
            credentials: "include",
            body: isFormData? body : JSON.stringify(body),
            headers: headers,
        });

        status = response.status;

        if (!response.ok) {
            console.error(`HTTP error Status: ${status}`);
            return { status };
        }

        const data = await response.json();
        return { status, data };
    } catch (error) {
        console.error("Fetch error:", error);
        return { status, error: error.toString() };
    }
}

export async function fetchDelete(url, token) {
    let status = 0;
    try {
        const response = await fetch(url, {
            method: "DELETE",
            credentials: "include",
            headers: {
                "Authorization": `Bearer ${token}`,
            },
        });

        status = response.status;

        if (!response.ok) {
            console.error(`HTTP error! Status: ${status}`);
            return { status };
        }

        const data = await response.json();
        return { status, data };
    } catch (error) {
        console.error("Fetch error:", error);
        return { status, error: error.toString() };
    }
}
