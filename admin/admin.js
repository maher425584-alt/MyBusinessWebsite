/* =====================================================
   MAHER BROTHERS - ADMIN PANEL
   SECURE SUPABASE ADMIN SYSTEM
===================================================== */


/* =====================================================
   SUPABASE CONFIG
===================================================== */

const SUPABASE_URL =
    "https://xnlhekdklcfgjmspgwtf.supabase.co";

const SUPABASE_KEY =
    "sb_publishable_d_NcNGQLU6ww5EaZCMdflQ_fEe0X_o2";


/* =====================================================
   ADMIN CONFIG
===================================================== */

const ADMIN_EMAIL =
    "maher425584@gmail.com";

const ADMIN_UID =
    "7a59ab39-07e6-45dc-acdb-be786ffca77c";


/* =====================================================
   HELPERS
===================================================== */

const $ = (id) =>
    document.getElementById(id);


function escapeHTML(value) {

    const div =
        document.createElement("div");

    div.textContent =
        value ?? "";

    return div.innerHTML;
}


/* =====================================================
   LOGIN STATUS
===================================================== */

function showLoginStatus(
    message,
    type = "error"
) {

    const box =
        $("loginStatus");

    if (!box) return;

    box.textContent =
        message;

    box.className =
        `status show ${type}`;

}


/* =====================================================
   ADMIN STATUS
===================================================== */

function showAdminStatus(
    message,
    type = "success"
) {

    const box =
        $("adminStatus");

    if (!box) return;

    box.textContent =
        message;

    box.className =
        `admin-status show ${type}`;


    setTimeout(() => {

        box.classList.remove("show");

    }, 5000);

}


/* =====================================================
   STORAGE
===================================================== */

function getAccessToken() {

    return sessionStorage.getItem(
        "admin_access_token"
    ) || "";

}


function getRefreshToken() {

    return sessionStorage.getItem(
        "admin_refresh_token"
    ) || "";

}


function getAdminEmail() {

    return sessionStorage.getItem(
        "admin_email"
    ) || "";

}


function clearAdminSession() {

    sessionStorage.removeItem(
        "admin_access_token"
    );

    sessionStorage.removeItem(
        "admin_refresh_token"
    );

    sessionStorage.removeItem(
        "admin_email"
    );

    sessionStorage.removeItem(
        "admin_uid"
    );

}


/* =====================================================
   AUTH HEADERS
===================================================== */

function authHeaders() {

    const token =
        getAccessToken();

    return {

        "Content-Type":
            "application/json",

        "apikey":
            SUPABASE_KEY,

        "Authorization":
            `Bearer ${token}`

    };

}


/* =====================================================
   SUPABASE LOGIN
===================================================== */

async function loginAdmin(
    email,
    password
) {

    const response =
        await fetch(
            `${SUPABASE_URL}/auth/v1/token?grant_type=password`,
            {

                method:
                    "POST",

                headers: {

                    "Content-Type":
                        "application/json",

                    "apikey":
                        SUPABASE_KEY

                },

                body:
                    JSON.stringify({

                        email:
                            email,

                        password:
                            password

                    })

            }
        );


    const data =
        await response.json();


    if (!response.ok) {

        throw new Error(
            data.msg ||
            data.message ||
            data.error_description ||
            "Invalid email or password."
        );

    }


    if (
        !data.access_token ||
        !data.user
    ) {

        throw new Error(
            "Invalid Supabase authentication response."
        );

    }


    const userEmail =
        String(
            data.user.email || ""
        )
        .toLowerCase()
        .trim();


    const userUID =
        String(
            data.user.id || ""
        )
        .trim();


    /* =================================================
       CHECK EMAIL
    ================================================= */

    if (
        userEmail !==
        ADMIN_EMAIL.toLowerCase()
    ) {

        throw new Error(
            "This account is not authorized as admin."
        );

    }


    /* =================================================
       CHECK UID
    ================================================= */

    if (
        userUID !==
        ADMIN_UID
    ) {

        throw new Error(
            "This user is not the authorized administrator."
        );

    }


    /* =================================================
       CHECK ADMIN_USERS TABLE
    ================================================= */

    const adminResponse =
        await fetch(
            `${SUPABASE_URL}/rest/v1/admin_users?user_id=eq.${encodeURIComponent(
                ADMIN_UID
            )}&select=user_id,email`,
            {

                method:
                    "GET",

                headers: {

                    "apikey":
                        SUPABASE_KEY,

                    "Authorization":
                        `Bearer ${data.access_token}`

                }

            }
        );


    const adminText =
        await adminResponse.text();


    if (!adminResponse.ok) {

        throw new Error(
            "Could not verify administrator account: " +
            adminText
        );

    }


    let adminRows = [];


    try {

        adminRows =
            JSON.parse(
                adminText
            );

    }
    catch(error) {

        throw new Error(
            "Invalid admin verification response."
        );

    }


    if (
        !Array.isArray(adminRows) ||
        adminRows.length === 0
    ) {

        throw new Error(
            "Your account is not registered in the admin_users table."
        );

    }


    const adminRecord =
        adminRows[0];


    if (
        adminRecord.user_id !==
        ADMIN_UID
    ) {

        throw new Error(
            "Administrator UID verification failed."
        );

    }


    /* =================================================
       SAVE SESSION
    ================================================= */

    sessionStorage.setItem(
        "admin_access_token",
        data.access_token
    );

    sessionStorage.setItem(
        "admin_refresh_token",
        data.refresh_token || ""
    );

    sessionStorage.setItem(
        "admin_email",
        userEmail
    );

    sessionStorage.setItem(
        "admin_uid",
        userUID
    );


    return data;

}


/* =====================================================
   VERIFY CURRENT SESSION
===================================================== */

async function verifyCurrentAdmin() {

    const token =
        getAccessToken();


    if (!token) {

        return false;

    }


    try {

        const response =
            await fetch(
                `${SUPABASE_URL}/auth/v1/user`,
                {

                    method:
                        "GET",

                    headers: {

                        "apikey":
                            SUPABASE_KEY,

                        "Authorization":
                            `Bearer ${token}`

                    }

                }
            );


        if (!response.ok) {

            return false;

        }


        const user =
            await response.json();


        if (
            String(user.id) !==
            ADMIN_UID
        ) {

            return false;

        }


        if (
            String(user.email)
                .toLowerCase()
                .trim() !==
            ADMIN_EMAIL.toLowerCase()
        ) {

            return false;

        }


        /* =============================================
           VERIFY ADMIN TABLE AGAIN
        ============================================= */

        const adminResponse =
            await fetch(
                `${SUPABASE_URL}/rest/v1/admin_users?user_id=eq.${encodeURIComponent(
                    ADMIN_UID
                )}&select=user_id`,
                {

                    headers: {

                        "apikey":
                            SUPABASE_KEY,

                        "Authorization":
                            `Bearer ${token}`

                    }

                }
            );


        if (!adminResponse.ok) {

            return false;

        }


        const admins =
            await adminResponse.json();


        if (
            !Array.isArray(admins) ||
            admins.length === 0
        ) {

            return false;

        }


        return true;

    }
    catch(error) {

        console.error(
            "Session verification error:",
            error
        );

        return false;

    }

}


/* =====================================================
   SCREEN CONTROL
===================================================== */

function showAdminScreen() {

    const loginScreen =
        $("loginScreen");

    const adminScreen =
        $("adminScreen");


    if (loginScreen) {

        loginScreen.classList.add(
            "hidden"
        );

    }


    if (adminScreen) {

        adminScreen.classList.remove(
            "hidden"
        );

    }


    loadPosts();

}


function showLoginScreen() {

    const loginScreen =
        $("loginScreen");

    const adminScreen =
        $("adminScreen");


    if (adminScreen) {

        adminScreen.classList.add(
            "hidden"
        );

    }


    if (loginScreen) {

        loginScreen.classList.remove(
            "hidden"
        );

    }

}


/* =====================================================
   LOGIN FORM
===================================================== */

const loginForm =
    $("loginForm");


if (loginForm) {

    loginForm.addEventListener(
        "submit",
        async event => {

            event.preventDefault();


            const email =
                $("loginEmail")
                    .value
                    .trim();


            const password =
                $("loginPassword")
                    .value;


            if (
                !email ||
                !password
            ) {

                showLoginStatus(
                    "Please enter email and password.",
                    "error"
                );

                return;

            }


            const button =
                $("loginButton");


            button.disabled =
                true;

            button.textContent =
                "Checking...";


            try {

                await loginAdmin(
                    email,
                    password
                );


                showLoginStatus(
                    "Login successful. Opening admin panel...",
                    "success"
                );


                setTimeout(
                    () => {

                        showAdminScreen();

                    },
                    500
                );

            }
            catch(error) {

                console.error(
                    "ADMIN LOGIN ERROR:",
                    error
                );


                clearAdminSession();


                showLoginStatus(
                    error.message,
                    "error"
                );

            }
            finally {

                button.disabled =
                    false;

                button.textContent =
                    "Login";

            }

        }
    );

}


/* =====================================================
   LOGOUT
===================================================== */

const logoutButton =
    $("logoutButton");


if (logoutButton) {

    logoutButton.addEventListener(
        "click",
        () => {

            clearAdminSession();

            showAdminStatus(
                "Logged out successfully.",
                "success"
            );


            setTimeout(
                showLoginScreen,
                200
            );

        }
    );

}


/* =====================================================
   LOAD ALL POSTS
===================================================== */

async function loadPosts() {

    const container =
        $("postsList");


    if (!container) return;


    container.innerHTML = `

        <div class="loading">
            Loading posts...
        </div>

    `;


    try {

        const token =
            getAccessToken();


        if (!token) {

            showLoginScreen();

            return;

        }


        const response =
            await fetch(
                `${SUPABASE_URL}/rest/v1/business_posts?order=created_at.desc`,
                {

                    method:
                        "GET",

                    headers:
                        authHeaders()

                }
            );


        const responseText =
            await response.text();


        if (!response.ok) {

            throw new Error(
                responseText
            );

        }


        let posts = [];


        try {

            posts =
                JSON.parse(
                    responseText
                );

        }
        catch(error) {

            throw new Error(
                "Invalid posts response."
            );

        }


        if (
            !Array.isArray(posts)
        ) {

            throw new Error(
                "Invalid posts data."
            );

        }


        updateStats(
            posts
        );


        renderPosts(
            posts
        );

    }
    catch(error) {

        console.error(
            "LOAD ADMIN POSTS ERROR:",
            error
        );


        container.innerHTML = `

            <div class="empty">

                <h3>
                    Could not load posts
                </h3>

                <p>
                    ${escapeHTML(
                        error.message
                    )}
                </p>

            </div>

        `;

    }

}


/* =====================================================
   UPDATE STATISTICS
===================================================== */

function updateStats(posts) {

    const pending =
        posts.filter(
            post =>
                post.status ===
                "pending"
        ).length;


    const approved =
        posts.filter(
            post =>
                post.status ===
                "approved"
        ).length;


    const rejected =
        posts.filter(
            post =>
                post.status ===
                "rejected"
        ).length;


    const total =
        posts.length;


    if ($("pendingCount")) {

        $("pendingCount")
            .textContent =
            pending;

    }


    if ($("approvedCount")) {

        $("approvedCount")
            .textContent =
            approved;

    }


    if ($("rejectedCount")) {

        $("rejectedCount")
            .textContent =
            rejected;

    }


    if ($("totalCount")) {

        $("totalCount")
            .textContent =
            total;

    }

}


/* =====================================================
   RENDER POSTS
===================================================== */

function renderPosts(posts) {

    const container =
        $("postsList");


    if (!container) return;


    if (!posts.length) {

        container.innerHTML = `

            <div class="empty">

                <h3>
                    No posts found
                </h3>

                <p>
                    Submitted posts will appear here.
                </p>

            </div>

        `;

        return;

    }


    container.innerHTML =
        "";


    posts.forEach(
        post => {

            const card =
                createPostCard(
                    post
                );


            container.appendChild(
                card
            );

        }
    );

}


/* =====================================================
   CREATE POST CARD
===================================================== */

function createPostCard(post) {

    const card =
        document.createElement(
            "article"
        );


    card.className =
        "post-admin-card";


    /* =================================================
       MEDIA
    ================================================= */

    let mediaHTML =
        "";


    if (
        post.media_url &&
        post.media_type ===
        "image"
    ) {

        mediaHTML = `

            <div class="post-admin-media">

                <img
                    src="${escapeHTML(
                        post.media_url
                    )}"
                    alt="${escapeHTML(
                        post.title
                    )}"
                    loading="lazy"
                >

            </div>

        `;

    }


    if (
        post.media_url &&
        post.media_type ===
        "video"
    ) {

        mediaHTML = `

            <div class="post-admin-media">

                <video
                    controls
                    preload="metadata"
                >

                    <source
                        src="${escapeHTML(
                            post.media_url
                        )}"
                    >

                </video>

            </div>

        `;

    }


    /* =================================================
       FILE
    ================================================= */

    let fileHTML =
        "";


    if (
        post.media_url &&
        post.media_type ===
        "file"
    ) {

        fileHTML = `

            <a
                class="file-link"
                href="${escapeHTML(
                    post.media_url
                )}"
                target="_blank"
                rel="noopener noreferrer"
            >

                📎
                ${escapeHTML(
                    post.media_name ||
                    "Open File"
                )}

            </a>

        `;

    }


    /* =================================================
       DATE
    ================================================= */

    const date =
        post.created_at
            ? new Date(
                post.created_at
              ).toLocaleString()
            : "Unknown";


    /* =================================================
       ACTIONS
    ================================================= */

    let actionsHTML =
        "";


    if (
        post.status ===
        "pending"
    ) {

        actionsHTML = `

            <button
                type="button"
                class="action-btn approve-btn"
                data-action="approve"
                data-id="${escapeHTML(
                    post.id
                )}"
            >

                ✓ Approve

            </button>


            <button
                type="button"
                class="action-btn reject-btn"
                data-action="reject"
                data-id="${escapeHTML(
                    post.id
                )}"
            >

                ✕ Reject

            </button>

        `;

    }


    actionsHTML += `

        <button
            type="button"
            class="action-btn delete-btn"
            data-action="delete"
            data-id="${escapeHTML(
                post.id
            )}"
        >

            🗑 Delete

        </button>

    `;


    /* =================================================
       CARD HTML
    ================================================= */

    card.innerHTML = `

        <div class="post-admin-top">

            <div>

                <h3>
                    ${escapeHTML(
                        post.title
                    )}
                </h3>

                <p class="post-description">

                    ${escapeHTML(
                        post.content
                    )}

                </p>

            </div>


            <span
                class="badge ${escapeHTML(
                    post.status ||
                    "pending"
                )}"
            >

                ${escapeHTML(
                    post.status ||
                    "pending"
                )}

            </span>

        </div>


        ${mediaHTML}


        ${fileHTML}


        <div class="post-details">

            <div class="detail-box">

                <strong>
                    Price
                </strong>

                <span>
                    ${escapeHTML(
                        post.price ||
                        "Not provided"
                    )}
                </span>

            </div>


            <div class="detail-box">

                <strong>
                    WhatsApp
                </strong>

                <span>
                    ${escapeHTML(
                        post.whatsapp ||
                        "Not provided"
                    )}
                </span>

            </div>

        </div>


        <div class="post-date">

            Submitted:
            ${escapeHTML(
                date
            )}

        </div>


        <div class="post-actions">

            ${actionsHTML}

        </div>

    `;


    /* =================================================
       BUTTON EVENTS
    ================================================= */

    card
        .querySelectorAll(
            "[data-action]"
        )
        .forEach(
            button => {

                button.addEventListener(
                    "click",
                    () => {

                        handlePostAction(
                            button.dataset.action,
                            button.dataset.id
                        );

                    }
                );

            }
        );


    return card;

}


/* =====================================================
   APPROVE / REJECT / DELETE
===================================================== */

async function handlePostAction(
    action,
    postId
) {

    if (!postId) {

        return;

    }


    /* =================================================
       DELETE
    ================================================= */

    if (
        action ===
        "delete"
    ) {

        const confirmed =
            confirm(
                "Are you sure you want to permanently delete this post?"
            );


        if (!confirmed) {

            return;

        }


        await deletePost(
            postId
        );


        return;

    }


    /* =================================================
       STATUS
    ================================================= */

    let newStatus =
        "";


    if (
        action ===
        "approve"
    ) {

        newStatus =
            "approved";

    }


    if (
        action ===
        "reject"
    ) {

        newStatus =
            "rejected";

    }


    if (!newStatus) {

        return;

    }


    const confirmed =
        confirm(
            `Change post status to "${newStatus}"?`
        );


    if (!confirmed) {

        return;

    }


    try {

        const response =
            await fetch(
                `${SUPABASE_URL}/rest/v1/business_posts?id=eq.${encodeURIComponent(
                    postId
                )}`,
                {

                    method:
                        "PATCH",

                    headers: {

                        ...authHeaders(),

                        "Prefer":
                            "return=minimal"

                    },

                    body:
                        JSON.stringify({

                            status:
                                newStatus

                        })

                }
            );


        const text =
            await response.text();


        if (!response.ok) {

            throw new Error(
                text
            );

        }


        showAdminStatus(
            `Post ${newStatus} successfully.`,
            "success"
        );


        await loadPosts();

    }
    catch(error) {

        console.error(
            "POST STATUS ERROR:",
            error
        );


        showAdminStatus(
            "Could not update post: " +
            error.message,
            "error"
        );

    }

}


/* =====================================================
   DELETE POST
===================================================== */

async function deletePost(
    postId
) {

    try {

        const response =
            await fetch(
                `${SUPABASE_URL}/rest/v1/business_posts?id=eq.${encodeURIComponent(
                    postId
                )}`,
                {

                    method:
                        "DELETE",

                    headers:
                        authHeaders()

                }
            );


        const text =
            await response.text();


        if (!response.ok) {

            throw new Error(
                text
            );

        }


        showAdminStatus(
            "Post deleted successfully.",
            "success"
        );


        await loadPosts();

    }
    catch(error) {

        console.error(
            "DELETE POST ERROR:",
            error
        );


        showAdminStatus(
            "Could not delete post: " +
            error.message,
            "error"
        );

    }

}


/* =====================================================
   REFRESH
===================================================== */

const refreshButton =
    $("refreshButton");


if (refreshButton) {

    refreshButton.addEventListener(
        "click",
        async () => {

            refreshButton.disabled =
                true;

            refreshButton.textContent =
                "↻ Loading...";


            await loadPosts();


            refreshButton.disabled =
                false;

            refreshButton.textContent =
                "↻ Refresh";

        }
    );

}


/* =====================================================
   AUTO REFRESH
===================================================== */

setInterval(
    async () => {

        if (
            !getAccessToken()
        ) {

            return;

        }


        const adminScreen =
            $("adminScreen");


        if (
            adminScreen &&
            !adminScreen.classList.contains(
                "hidden"
            )
        ) {

            await loadPosts();

        }

    },
    30000
);


/* =====================================================
   INITIAL START
===================================================== */

(async function initAdmin() {

    const token =
        getAccessToken();


    if (!token) {

        showLoginScreen();

        return;

    }


    const valid =
        await verifyCurrentAdmin();


    if (!valid) {

        clearAdminSession();

        showLoginScreen();

        return;

    }


    showAdminScreen();

})();
/* =====================================================
   CONTACT MESSAGES
===================================================== */

const messagesList =
    $("messagesList");

const messagesStatus =
    $("messagesStatus");

const refreshMessagesButton =
    $("refreshMessagesButton");


function showMessagesStatus(
    message,
    type = "success"
) {

    if (!messagesStatus) return;

    messagesStatus.textContent =
        message;

    messagesStatus.className =
        `admin-status show ${type}`;

    setTimeout(() => {

        messagesStatus.classList.remove(
            "show"
        );

    }, 5000);

}


/* =====================================================
   LOAD CONTACT MESSAGES
===================================================== */

async function loadContactMessages() {

    if (!messagesList) return;


    messagesList.innerHTML = `

        <div class="loading">

            📩 Loading messages...

        </div>

    `;


    try {

        const response =
            await fetch(
                `${SUPABASE_URL}/rest/v1/contact_messages?select=id,name,email,subject,message,status,created_at&order=created_at.desc`,
                {

                    method:
                        "GET",

                    headers:
                        authHeaders()

                }
            );


        const responseText =
            await response.text();


        if (!response.ok) {

            throw new Error(
                responseText
            );

        }


        const messages =
            JSON.parse(
                responseText
            );


        renderContactMessages(
            messages
        );


    }
    catch(error) {

        console.error(
            "CONTACT MESSAGES ERROR:",
            error
        );


        messagesList.innerHTML = `

            <div class="empty">

                <h3>
                    Could not load messages
                </h3>

                <p>
                    ${escapeHTML(
                        error.message
                    )}
                </p>

            </div>

        `;

    }

}


/* =====================================================
   RENDER CONTACT MESSAGES
===================================================== */

function renderContactMessages(
    messages
) {

    if (!messagesList) return;


    if (
        !Array.isArray(messages) ||
        messages.length === 0
    ) {

        messagesList.innerHTML = `

            <div class="empty">

                <div style="font-size:40px;">
                    📭
                </div>

                <h3>
                    No Contact Messages
                </h3>

                <p>
                    New messages from your website
                    will appear here.
                </p>

            </div>

        `;

        return;

    }


    messagesList.innerHTML = "";


    messages.forEach(
        message => {

            const card =
                document.createElement(
                    "article"
                );


            card.className =
                `contact-message-card ${
                    message.status === "unread"
                        ? "unread"
                        : ""
                }`;


            const date =
                message.created_at
                    ? new Date(
                        message.created_at
                    ).toLocaleString()
                    : "Unknown";


            card.innerHTML = `

                <div class="contact-message-top">

                    <div>

                        <div class="contact-message-name">

                            👤
                            ${escapeHTML(
                                message.name
                            )}

                        </div>

                        <a
                            class="contact-message-email"
                            href="mailto:${escapeHTML(
                                message.email
                            )}"
                        >

                            ✉
                            ${escapeHTML(
                                message.email
                            )}

                        </a>

                    </div>


                    <span
                        class="message-status ${
                            message.status === "unread"
                                ? "unread"
                                : "read"
                        }"
                    >

                        ${
                            message.status === "unread"
                                ? "NEW"
                                : "READ"
                        }

                    </span>

                </div>


                <div class="contact-message-subject">

                    ${escapeHTML(
                        message.subject
                    )}

                </div>


                <div class="contact-message-body">

                    ${escapeHTML(
                        message.message
                    )}

                </div>


                <div class="contact-message-footer">

                    <span>

                        🕒
                        ${escapeHTML(
                            date
                        )}

                    </span>


                    <div class="message-actions">

                        ${
                            message.status === "unread"
                            ? `
                                <button
                                    class="message-action read-message-btn"
                                    data-message-action="read"
                                    data-id="${escapeHTML(
                                        message.id
                                    )}"
                                >
                                    ✓ Mark Read
                                </button>
                            `
                            : ""
                        }


                        <a
                            class="message-action reply-message-btn"
                            href="mailto:${escapeHTML(
                                message.email
                            )}?subject=${encodeURIComponent(
                                "Re: " +
                                (message.subject || "Your Message")
                            )}"
                        >
                            ↩ Reply
                        </a>


                        <button
                            class="message-action delete-message-btn"
                            data-message-action="delete"
                            data-id="${escapeHTML(
                                message.id
                            )}"
                        >
                            🗑 Delete
                        </button>

                    </div>

                </div>

            `;


            messagesList.appendChild(
                card
            );

        }
    );


    messagesList
        .querySelectorAll(
            "[data-message-action]"
        )
        .forEach(
            button => {

                button.addEventListener(
                    "click",
                    () => {

                        handleContactMessageAction(
                            button.dataset.messageAction,
                            button.dataset.id
                        );

                    }
                );

            }
        );

}


/* =====================================================
   MESSAGE ACTIONS
===================================================== */

async function handleContactMessageAction(
    action,
    messageId
) {

    if (!messageId) return;


    if (
        action === "delete"
    ) {

        const confirmed =
            confirm(
                "Are you sure you want to permanently delete this message?"
            );


        if (!confirmed) {
            return;
        }


        try {

            const response =
                await fetch(
                    `${SUPABASE_URL}/rest/v1/contact_messages?id=eq.${encodeURIComponent(
                        messageId
                    )}`,
                    {

                        method:
                            "DELETE",

                        headers:
                            authHeaders()

                    }
                );


            const text =
                await response.text();


            if (!response.ok) {

                throw new Error(
                    text
                );

            }


            showMessagesStatus(
                "Message deleted successfully.",
                "success"
            );


            await loadContactMessages();

        }
        catch(error) {

            console.error(
                "DELETE MESSAGE ERROR:",
                error
            );


            showMessagesStatus(
                "Could not delete message.",
                "error"
            );

        }


        return;

    }


    if (
        action === "read"
    ) {

        try {

            const response =
                await fetch(
                    `${SUPABASE_URL}/rest/v1/contact_messages?id=eq.${encodeURIComponent(
                        messageId
                    )}`,
                    {

                        method:
                            "PATCH",

                        headers: {

                            ...authHeaders(),

                            "Prefer":
                                "return=minimal"

                        },

                        body:
                            JSON.stringify({

                                status:
                                    "read"

                            })

                    }
                );


            const text =
                await response.text();


            if (!response.ok) {

                throw new Error(
                    text
                );

            }


            showMessagesStatus(
                "Message marked as read.",
                "success"
            );


            await loadContactMessages();

        }
        catch(error) {

            console.error(
                "READ MESSAGE ERROR:",
                error
            );


            showMessagesStatus(
                "Could not update message.",
                "error"
            );

        }

    }

}


/* =====================================================
   MESSAGE REFRESH
===================================================== */

if (
    refreshMessagesButton
) {

    refreshMessagesButton.addEventListener(
        "click",
        loadContactMessages
    );

}


/* =====================================================
   START CONTACT MESSAGES
===================================================== */

if (
    getAccessToken()
) {

    setTimeout(
        loadContactMessages,
        500
    );

}
/* =====================================================
   CONTACT MESSAGES
===================================================== */

async function loadContactMessages() {

    const container =
        $("messagesList");

    if (!container) return;


    container.innerHTML = `
        <div class="loading">
            Loading messages...
        </div>
    `;


    try {

        const response =
            await fetch(
                `${SUPABASE_URL}/rest/v1/contact_messages?order=created_at.desc`,
                {
                    method: "GET",
                    headers: authHeaders()
                }
            );


        const responseText =
            await response.text();


        if (!response.ok) {

            throw new Error(
                responseText
            );

        }


        const messages =
            JSON.parse(
                responseText
            );


        renderContactMessages(
            messages
        );

    }
    catch (error) {

        console.error(
            "Load contact messages error:",
            error
        );


        container.innerHTML = `

            <div class="empty">

                <h3>
                    Could not load messages
                </h3>

                <p>
                    ${escapeHTML(
                        error.message
                    )}
                </p>

            </div>

        `;

    }

}


/* =====================================================
   RENDER CONTACT MESSAGES
===================================================== */

function renderContactMessages(
    messages
) {

    const container =
        $("messagesList");


    if (!container) return;


    if (!messages.length) {

        container.innerHTML = `

            <div class="empty">

                <h3>
                    No messages yet
                </h3>

                <p>
                    Messages submitted through your website
                    contact form will appear here.
                </p>

            </div>

        `;

        return;

    }


    container.innerHTML = "";


    messages.forEach(
        message => {

            const card =
                document.createElement(
                    "article"
                );


            card.className =
                "post-admin-card";


            const date =
                message.created_at
                    ? new Date(
                        message.created_at
                      ).toLocaleString()
                    : "";


            card.innerHTML = `

                <div class="post-admin-top">

                    <div>

                        <h3>
                            ${escapeHTML(
                                message.subject
                            )}
                        </h3>

                        <p class="post-description">
                            ${escapeHTML(
                                message.message
                            )}
                        </p>

                    </div>

                    <span class="badge approved">
                        NEW
                    </span>

                </div>


                <div class="post-details">

                    <div class="detail-box">

                        <strong>
                            Name
                        </strong>

                        ${escapeHTML(
                            message.name
                        )}

                    </div>


                    <div class="detail-box">

                        <strong>
                            Email
                        </strong>

                        ${escapeHTML(
                            message.email
                        )}

                    </div>

                </div>


                <div class="post-date">

                    Received:
                    ${escapeHTML(
                        date
                    )}

                </div>

            `;


            container.appendChild(
                card
            );

        }
    );

}


/* =====================================================
   REFRESH CONTACT MESSAGES
===================================================== */

const refreshMessagesButton =
    $("refreshMessagesButton");


if (refreshMessagesButton) {

    refreshMessagesButton.addEventListener(
        "click",
        loadContactMessages
    );

}


/* =====================================================
   LOAD MESSAGES WITH ADMIN DASHBOARD
===================================================== */

const originalShowAdminScreen =
    showAdminScreen;


showAdminScreen =
    function() {

        $("loginScreen")
            .classList.add("hidden");


        $("adminScreen")
            .classList.remove("hidden");


        loadPosts();

        loadContactMessages();

    };