/* =====================================================
   SUPABASE CONFIG
===================================================== */

const SUPABASE_URL =
    "https://xnlhekdklcfgjmspgwtf.supabase.co";

const SUPABASE_KEY =
    "sb_publishable_d_NcNGQLU6ww5EaZCMdflQ_fEe0X_o2";


/* =====================================================
   GLOBAL HELPERS
===================================================== */

const $ = (id) => document.getElementById(id);

function escapeHTML(value) {

    const div = document.createElement("div");

    div.textContent = value ?? "";

    return div.innerHTML;
}

function showStatus(message, type = "success") {

    const status = $("postStatus");

    if (!status) return;

    status.textContent = message;

    status.className =
        `post-status show ${type}`;

    setTimeout(() => {

        status.classList.remove("show");

    }, 5000);
}


/* =====================================================
   MOBILE NAVIGATION
===================================================== */

const menuBtn = $("menuBtn");
const navMenu = $("navMenu");

if (menuBtn && navMenu) {

    menuBtn.addEventListener("click", () => {

        navMenu.classList.toggle("active");

    });

    navMenu.querySelectorAll("a").forEach(link => {

        link.addEventListener("click", () => {

            navMenu.classList.remove("active");

        });

    });

}


/* =====================================================
   CURRENT YEAR
===================================================== */

const yearElement = $("year");

if (yearElement) {

    yearElement.textContent =
        new Date().getFullYear();

}


/* =====================================================
   NAV ACTIVE STATE
===================================================== */

const pageSections =
    document.querySelectorAll("section[id]");

const navigationLinks =
    document.querySelectorAll("#navMenu a");

const updateActiveNav = () => {

    let current = "home";

    pageSections.forEach(section => {

        const top =
            section.getBoundingClientRect().top;

        if (top <= 140) {

            current = section.id;

        }

    });

    navigationLinks.forEach(link => {

        link.classList.remove("active");

        if (
            link.getAttribute("href") ===
            `#${current}`
        ) {

            link.classList.add("active");

        }

    });

};

window.addEventListener(
    "scroll",
    updateActiveNav
);

updateActiveNav();

/* =====================================================
   CONTACT FORM — SUPABASE
===================================================== */

const contactForm = $("contactForm");

if (contactForm) {

    contactForm.addEventListener(
        "submit",
        async function(event) {

            event.preventDefault();

            const name =
                $("name").value.trim();

            const email =
                $("email").value.trim();

            const subject =
                $("subject").value.trim();

            const message =
                $("message").value.trim();


            if (
                !name ||
                !email ||
                !subject ||
                !message
            ) {

                alert(
                    "Please complete all fields."
                );

                return;
            }


            const submitButton =
                contactForm.querySelector(
                    'button[type="submit"]'
                );


            submitButton.disabled = true;

            submitButton.textContent =
                "Sending...";


            try {

                const response =
                    await fetch(
                        `${SUPABASE_URL}/rest/v1/contact_messages`,
                        {

                            method: "POST",

                            headers: {

                                "Content-Type":
                                    "application/json",

                                "apikey":
                                    SUPABASE_KEY,

                                "Prefer":
                                    "return=minimal"

                            },

                            body:
                                JSON.stringify({

                                    name:
                                        name,

                                    email:
                                        email,

                                    subject:
                                        subject,

                                    message:
                                        message

                                })

                        }
                    );


                const responseText =
                    await response.text();


                if (!response.ok) {

                    console.error(
                        "Supabase contact error:",
                        responseText
                    );

                    throw new Error(
                        "Message could not be sent."
                    );
                }


                alert(
                    "✅ Message sent successfully! We will contact you soon."
                );


                contactForm.reset();

            }
            catch (error) {

                console.error(
                    "Contact form error:",
                    error
                );

                alert(
                    "❌ Message could not be sent. Please try again."
                );

            }
            finally {

                submitButton.disabled = false;

                submitButton.textContent =
                    "Send Message →";

            }

        }
    );

}
/* =====================================================
   POST MEDIA SELECTION
===================================================== */

let selectedPostMedia = null;

const postImage = $("postImage");
const postVideo = $("postVideo");
const postFile = $("postFile");

const selectedMedia =
    $("selectedMedia");

const imagePreview =
    $("imagePreview");


function clearMediaSelection() {

    selectedPostMedia = null;

    if (postImage) postImage.value = "";
    if (postVideo) postVideo.value = "";
    if (postFile) postFile.value = "";

    if (selectedMedia) {

        selectedMedia.innerHTML = "";

    }

    if (imagePreview) {

        imagePreview.innerHTML = "";

    }

}


function showSelectedFile(file, type) {

    if (!file || !selectedMedia) return;

    selectedPostMedia = {
        file: file,
        type: type
    };


    selectedMedia.innerHTML = `

        <div class="selected-file">

            <span>
                ${type === "image" ? "🖼️" :
                  type === "video" ? "🎥" : "📎"}

                ${escapeHTML(file.name)}
                (${formatFileSize(file.size)})
            </span>

            <button
                type="button"
                class="remove-file"
                id="removeMedia">

                Remove

            </button>

        </div>
    `;


    const removeButton =
        $("removeMedia");

    if (removeButton) {

        removeButton.addEventListener(
            "click",
            clearMediaSelection
        );

    }


    if (
        type === "image" &&
        imagePreview
    ) {

        const reader =
            new FileReader();

        reader.onload = function(event) {

            imagePreview.innerHTML = `

                <img
                    src="${event.target.result}"
                    alt="Selected image preview">

            `;

        };

        reader.readAsDataURL(file);

    } else if (imagePreview) {

        imagePreview.innerHTML = "";

    }

}


function formatFileSize(bytes) {

    if (bytes < 1024) {

        return `${bytes} B`;

    }

    if (bytes < 1024 * 1024) {

        return `${(bytes / 1024).toFixed(1)} KB`;

    }

    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;

}


if (postImage) {

    postImage.addEventListener(
        "change",
        function() {

            const file =
                this.files[0];

            if (file) {

                showSelectedFile(
                    file,
                    "image"
                );

            }

        }
    );

}


if (postVideo) {

    postVideo.addEventListener(
        "change",
        function() {

            const file =
                this.files[0];

            if (file) {

                showSelectedFile(
                    file,
                    "video"
                );

            }

        }
    );

}


if (postFile) {

    postFile.addEventListener(
        "change",
        function() {

            const file =
                this.files[0];

            if (file) {

                showSelectedFile(
                    file,
                    "file"
                );

            }

        }
    );

}


/* =====================================================
   POST SYSTEM
===================================================== */

const submitPostBtn =
    $("submitPostBtn");


async function uploadPostMedia(file) {

    if (!file) {

        return {
            url: null,
            path: null
        };

    }


    const safeName =
        file.name
            .replace(/[^a-zA-Z0-9._-]/g, "_");


    const filePath =
        `posts/${Date.now()}_${safeName}`;


    const response =
        await fetch(
            `${SUPABASE_URL}/storage/v1/object/business-posts/${filePath}`,
            {

                method: "POST",

                headers: {

                    "apikey":
                        SUPABASE_KEY,

                    "Authorization":
                        `Bearer ${SUPABASE_KEY}`,

                    "Content-Type":
                        file.type ||
                        "application/octet-stream"

                },

                body: file

            }
        );


    if (!response.ok) {

        const errorText =
            await response.text();

        throw new Error(
            `Media upload failed: ${errorText}`
        );

    }


    const publicUrl =
        `${SUPABASE_URL}/storage/v1/object/public/business-posts/${filePath}`;


    return {
        url: publicUrl,
        path: filePath
    };

}


async function submitPost() {

    const title =
        $("postTitle").value.trim();

    const content =
        $("postContent").value.trim();

    const price =
        $("postPrice").value.trim();

    const whatsapp =
        $("postWhatsapp").value.trim();


    if (!title) {

        showStatus(
            "Please enter a post title.",
            "error"
        );

        return;

    }


    if (!content) {

        showStatus(
            "Please enter post description/text.",
            "error"
        );

        return;

    }


    submitPostBtn.disabled = true;

    submitPostBtn.textContent =
        "Uploading...";


    try {

        let mediaUrl = null;
        let mediaType = null;
        let mediaName = null;
        let mediaPath = null;


        if (selectedPostMedia) {

            const upload =
                await uploadPostMedia(
                    selectedPostMedia.file
                );


            mediaUrl =
                upload.url;

            mediaPath =
                upload.path;

            mediaType =
                selectedPostMedia.type;

            mediaName =
                selectedPostMedia.file.name;

        }


        const response =
            await fetch(
                `${SUPABASE_URL}/rest/v1/business_posts`,
                {

                    method: "POST",

                    headers: {

                        "Content-Type":
                            "application/json",

                        "apikey":
                            SUPABASE_KEY,

                        "Authorization":
                            `Bearer ${SUPABASE_KEY}`,

                        "Prefer":
                            "return=minimal"

                    },

                    body: JSON.stringify({

                        title: title,

                        content: content,

                        price: price || null,

                        whatsapp: whatsapp || null,

                        media_url:
                            mediaUrl,

                        media_type:
                            mediaType,

                        media_name:
                            mediaName,

                        media_path:
                            mediaPath,

                        status:
                            "pending"

                    })

                }
            );


        if (!response.ok) {

            const error =
                await response.text();

            throw new Error(error);

        }


        $("postTitle").value = "";
        $("postContent").value = "";
        $("postPrice").value = "";
        $("postWhatsapp").value = "";

        clearMediaSelection();


        showStatus(
            "Post submitted successfully. It is now waiting for admin approval.",
            "success"
        );

    }
   catch(error) {

    console.error("POST SUBMISSION ERROR:", error);

    showStatus(
        "ERROR: " + error.message,
        "error"
    );

}
 finally {

        submitPostBtn.disabled = false;

        submitPostBtn.textContent =
            "+ Submit Post for Approval";

    }

}


if (submitPostBtn) {

    submitPostBtn.addEventListener(
        "click",
        submitPost
    );

}


/* =====================================================
   LOAD APPROVED POSTS
===================================================== */

async function loadApprovedPosts() {

    const container =
        $("postsContainer");

    if (!container) return;


    try {

        const response =
            await fetch(
                `${SUPABASE_URL}/rest/v1/business_posts?status=eq.approved&order=created_at.desc`,
                {

                    headers: {

                        "apikey":
                            SUPABASE_KEY,

                        "Authorization":
                            `Bearer ${SUPABASE_KEY}`

                    }

                }
            );


        if (!response.ok) {

            throw new Error(
                await response.text()
            );

        }


        const posts =
            await response.json();


        container.innerHTML = "";


        if (!posts.length) {

            container.innerHTML = `

                <div class="post-card">

                    <h3>
                        No posts published yet
                    </h3>

                    <p>
                        Approved business updates and products
                        will appear here.
                    </p>

                </div>

            `;

            return;

        }


        posts.forEach(
            post => renderPost(
                container,
                post
            )
        );

    }
    catch(error) {

        console.error(
            "Load posts error:",
            error
        );

        container.innerHTML = `

            <div class="post-card">

                <h3>
                    Posts are temporarily unavailable
                </h3>

                <p>
                    Please try again later.
                </p>

            </div>

        `;

    }

}


function renderPost(container, post) {

    const card =
        document.createElement("article");

    card.className =
        "post-card";


    let mediaHTML = "";


    if (
        post.media_url &&
        post.media_type === "image"
    ) {

        mediaHTML = `

            <div class="post-media">

                <img
                    src="${escapeHTML(post.media_url)}"
                    alt="${escapeHTML(post.title)}"
                    loading="lazy">

            </div>

        `;

    }


    if (
        post.media_url &&
        post.media_type === "video"
    ) {

        mediaHTML = `

            <div class="post-media">

                <video
                    controls
                    preload="metadata">

                    <source
                        src="${escapeHTML(post.media_url)}">

                </video>

            </div>

        `;

    }


    let fileHTML = "";


    if (
        post.media_url &&
        post.media_type === "file"
    ) {

        fileHTML = `

            <a
                class="post-file"
                href="${escapeHTML(post.media_url)}"
                target="_blank"
                rel="noopener noreferrer">

                📎 Open ${escapeHTML(
                    post.media_name || "File"
                )}

            </a>

        `;

    }


    let productHTML = "";


    if (
        post.price ||
        post.whatsapp
    ) {

        let whatsappHTML = "";


        if (post.whatsapp) {

            const cleanNumber =
                String(post.whatsapp)
                    .replace(/\D/g, "");


            const productText =
                `Hello, I am interested in: ${post.title}`;


            whatsappHTML = `

                <a
                    class="product-whatsapp"
                    href="https://wa.me/${cleanNumber}?text=${encodeURIComponent(productText)}"
                    target="_blank"
                    rel="noopener noreferrer">

                    WhatsApp Seller

                </a>

            `;

        }


        productHTML = `

            <div class="product-info">

                <span class="product-price">

                    ${escapeHTML(
                        post.price || "Contact for price"
                    )}

                </span>

                ${whatsappHTML}

            </div>

        `;

    }


    const date =
        post.created_at
            ? new Date(
                post.created_at
              ).toLocaleDateString()
            : "";


    card.innerHTML = `

        ${mediaHTML}

        <div class="post-date">
            ${escapeHTML(date)}
        </div>

        <h3>
            ${escapeHTML(post.title)}
        </h3>

        <p>
            ${escapeHTML(post.content)}
        </p>

        ${fileHTML}

        ${productHTML}

    `;


    container.appendChild(card);

}


loadApprovedPosts();


/* =====================================================
   CHAT SYSTEM
===================================================== */

const chatButton =
    $("chatButton");

const chatBox =
    $("chatBox");

const closeChat =
    $("closeChat");

const startChat =
    $("startChat");

const sendChat =
    $("sendChat");

const visitorForm =
    $("visitorForm");

const chatInputArea =
    $("chatInputArea");

const visitorName =
    $("visitorName");

const chatMessage =
    $("chatMessage");

const chatBody =
    $("chatBody");


let currentVisitorName =
    sessionStorage.getItem(
        "businessVisitorName"
    ) || "";


function openBusinessChat() {

    if (!chatBox) return;

    chatBox.classList.add("active");

    document.body.classList.add(
        "chat-open"
    );


    if (currentVisitorName) {

        visitorForm.style.display =
            "none";

        chatInputArea.style.display =
            "flex";

        loadVisitorMessages();

    }
}


function closeBusinessChat() {

    if (!chatBox) return;

    chatBox.classList.remove(
        "active"
    );

    document.body.classList.remove(
        "chat-open"
    );

}


if (chatButton) {

    chatButton.addEventListener(
        "click",
        openBusinessChat
    );

}


if (closeChat) {

    closeChat.addEventListener(
        "click",
        closeBusinessChat
    );

}


if (startChat) {

    startChat.addEventListener(
        "click",
        startVisitorChat
    );

}


if (visitorName) {

    visitorName.addEventListener(
        "keydown",
        event => {

            if (event.key === "Enter") {

                startVisitorChat();

            }

        }
    );

}


function startVisitorChat() {

    const name =
        visitorName.value.trim();


    if (!name) {

        alert(
            "Please enter your name."
        );

        return;

    }


    currentVisitorName =
        name;


    sessionStorage.setItem(
        "businessVisitorName",
        name
    );


    visitorForm.style.display =
        "none";

    chatInputArea.style.display =
        "flex";


    addChatMessage(
        `Hello ${name}! 👋 Please type your message below.`,
        "admin"
    );


    loadVisitorMessages();

    chatMessage.focus();

}


if (sendChat) {

    sendChat.addEventListener(
        "click",
        sendChatMessage
    );

}


if (chatMessage) {

    chatMessage.addEventListener(
        "keydown",
        event => {

            if (event.key === "Enter") {

                event.preventDefault();

                sendChatMessage();

            }

        }
    );

}


function addChatMessage(
    message,
    sender
) {

    if (!chatBody) return;


    const div =
        document.createElement("div");


    div.className =
        `chat-message ${sender}`;


    div.textContent =
        message;


    chatBody.appendChild(div);


    chatBody.scrollTop =
        chatBody.scrollHeight;

}


async function sendChatMessage() {

    const message =
        chatMessage.value.trim();


    if (!message) return;


    if (!currentVisitorName) {

        alert(
            "Please enter your name first."
        );

        return;

    }


    addChatMessage(
        message,
        "visitor"
    );


    chatMessage.value = "";


    try {

        const response =
            await fetch(
                `${SUPABASE_URL}/rest/v1/chat_messages`,
                {

                    method: "POST",

                    headers: {

                        "Content-Type":
                            "application/json",

                        "apikey":
                            SUPABASE_KEY,

                        "Authorization":
                            `Bearer ${SUPABASE_KEY}`,

                        "Prefer":
                            "return=minimal"

                    },

                    body: JSON.stringify({

                        visitor_name:
                            currentVisitorName,

                        message:
                            message,

                        sender:
                            "visitor"

                    })

                }
            );


        if (!response.ok) {

            const error =
                await response.text();

            console.error(
                "Chat error:",
                error
            );

            alert(
                "Message could not be sent."
            );

        }

    }
    catch(error) {

        console.error(
            "Chat connection error:",
            error
        );

        alert(
            "Connection error. Please try again."
        );

    }

}


async function loadVisitorMessages() {

    if (!currentVisitorName) return;


    try {

        const encodedName =
            encodeURIComponent(
                currentVisitorName
            );


        const response =
            await fetch(
                `${SUPABASE_URL}/rest/v1/chat_messages?visitor_name=eq.${encodedName}&order=created_at.asc`,
                {

                    headers: {

                        "apikey":
                            SUPABASE_KEY,

                        "Authorization":
                            `Bearer ${SUPABASE_KEY}`

                    }

                }
            );


        if (!response.ok) {

            return;

        }


        const messages =
            await response.json();


        if (!chatBody) return;


        const welcome =
            chatBody.querySelector(
                ".chat-welcome"
            );


        chatBody.innerHTML = "";


        if (welcome) {

            chatBody.appendChild(
                welcome
            );

        }


        messages.forEach(
            item => {

                addChatMessage(
                    item.message,
                    item.sender === "admin"
                        ? "admin"
                        : "visitor"
                );

            }
        );

    }
    catch(error) {

        console.error(
            "Load chat error:",
            error
        );

    }

}


/* =====================================================
   CHAT AUTO REFRESH
===================================================== */

setInterval(
    () => {

        if (
            chatBox &&
            chatBox.classList.contains(
                "active"
            ) &&
            currentVisitorName
        ) {

            loadVisitorMessages();

        }

    },
    5000
);


/* =====================================================
   ESCAPE CHAT WITH ESC KEY
===================================================== */

document.addEventListener(
    "keydown",
    event => {

        if (
            event.key === "Escape" &&
            chatBox &&
            chatBox.classList.contains(
                "active"
            )
        ) {

            closeBusinessChat();

        }

    }
);