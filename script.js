/* =========================
   MOBILE MENU
========================= */

const menuBtn = document.getElementById("menuBtn");
const navMenu = document.getElementById("navMenu");

if (menuBtn && navMenu) {

    menuBtn.addEventListener("click", () => {
        navMenu.classList.toggle("active");
    });

    document.querySelectorAll("#navMenu a").forEach(link => {

        link.addEventListener("click", () => {
            navMenu.classList.remove("active");
        });

    });

}


/* =========================
   CURRENT YEAR
========================= */

const yearElement = document.getElementById("year");

if (yearElement) {
    yearElement.textContent = new Date().getFullYear();
}


/* =========================
   POSTS SYSTEM
========================= */

let posts =
    JSON.parse(localStorage.getItem("businessPosts")) || [

        {
            title: "Welcome to Our Business",
            content:
                "Welcome to our official business website. Follow our latest updates, offers and announcements here.",
            date: new Date().toLocaleDateString()
        },

        {
            title: "Quality Is Our Priority",
            content:
                "We are committed to providing reliable services and maintaining high standards for our customers.",
            date: new Date().toLocaleDateString()
        }

    ];


function displayPosts() {

    const container =
        document.getElementById("postsContainer");

    if (!container) return;

    container.innerHTML = "";

    posts.forEach((post, index) => {

        const card =
            document.createElement("div");

        card.className = "post-card";

        card.innerHTML = `

            <div class="post-date">
                ${escapeHTML(post.date)}
            </div>

            <h3>
                ${escapeHTML(post.title)}
            </h3>

            <p>
                ${escapeHTML(post.content)}
            </p>

            <button
                class="delete-post"
                onclick="deletePost(${index})"
            >
                Delete Post
            </button>

        `;

        container.appendChild(card);

    });

}


function addPost() {

    const title =
        document.getElementById("postTitle").value.trim();

    const content =
        document.getElementById("postContent").value.trim();


    if (!title || !content) {

        alert("Please enter post title and content.");

        return;

    }


    posts.unshift({

        title: title,

        content: content,

        date: new Date().toLocaleDateString()

    });


    localStorage.setItem(
        "businessPosts",
        JSON.stringify(posts)
    );


    document.getElementById("postTitle").value = "";

    document.getElementById("postContent").value = "";


    displayPosts();

    alert("Post published successfully!");

}


function deletePost(index) {

    if (
        confirm(
            "Are you sure you want to delete this post?"
        )
    ) {

        posts.splice(index, 1);

        localStorage.setItem(
            "businessPosts",
            JSON.stringify(posts)
        );

        displayPosts();

    }

}


function escapeHTML(text) {

    const div =
        document.createElement("div");

    div.textContent = text;

    return div.innerHTML;

}


displayPosts();


/* =========================
   CONTACT FORM
========================= */

function sendMessage(event) {

    event.preventDefault();

    const name =
        document.getElementById("name").value;

    const email =
        document.getElementById("email").value;

    const subject =
        document.getElementById("subject").value;

    const message =
        document.getElementById("message").value;


    const phone = "923000000000";


    const whatsappMessage =
        `Hello Prime Business,

Name: ${name}
Email: ${email}
Subject: ${subject}

Message:
${message}`;


    const url =
        `https://wa.me/${phone}?text=${encodeURIComponent(whatsappMessage)}`;


    window.open(url, "_blank");

}


/* =========================
   SUPABASE CHAT
========================= */

const SUPABASE_URL =
    "https://xnlhekdklcfgjmspgwtf.supabase.co";

const SUPABASE_KEY =
    "sb_publishable_d_NcNGQLU6ww5EaZCMdflQ_fEe0X_o2";


let currentVisitorName = "";


/* CHAT ELEMENTS */

const chatButton =
    document.getElementById("chatButton");

const chatBox =
    document.getElementById("chatBox");

const closeChat =
    document.getElementById("closeChat");

const startChat =
    document.getElementById("startChat");

const sendChat =
    document.getElementById("sendChat");

const visitorForm =
    document.getElementById("visitorForm");

const chatInputArea =
    document.getElementById("chatInputArea");

const visitorName =
    document.getElementById("visitorName");

const chatMessage =
    document.getElementById("chatMessage");

const chatBody =
    document.getElementById("chatBody");


/* OPEN CHAT */

if (chatButton && chatBox) {

    chatButton.addEventListener("click", () => {

        chatBox.classList.add("active");

    });

}


/* CLOSE CHAT */

if (closeChat && chatBox) {

    closeChat.addEventListener("click", () => {

        chatBox.classList.remove("active");

    });

}


/* START CHAT */

if (startChat) {

    startChat.addEventListener("click", () => {

        const name =
            visitorName.value.trim();


        if (!name) {

            alert("Please enter your name.");

            return;

        }


        currentVisitorName = name;


        visitorForm.style.display = "none";

        chatInputArea.style.display = "flex";


        addChatMessage(
            `Hello ${name}! 👋 Please type your message below.`,
            "admin"
        );

    });

}


/* SEND CHAT */

if (sendChat) {

    sendChat.addEventListener(
        "click",
        sendChatMessage
    );

}


if (chatMessage) {

    chatMessage.addEventListener(
        "keydown",
        (event) => {

            if (event.key === "Enter") {

                sendChatMessage();

            }

        }
    );

}


/* SEND MESSAGE TO SUPABASE */

async function sendChatMessage() {

    const message =
        chatMessage.value.trim();


    if (!message) {
        return;
    }


    if (!currentVisitorName) {

        alert("Please enter your name first.");

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
                "Supabase error:",
                error
            );

            alert(
                "Message could not be sent."
            );

        }

    }

    catch (error) {

        console.error(error);

        alert(
            "Connection error."
        );

    }

}


/* ADD CHAT MESSAGE */

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