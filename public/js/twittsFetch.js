// deconstruct userValidatioin fetch here
function newPostTime() {
    if (window.location.pathname !== `/home`) {
        window.location.href = '/home';
    }
    document.querySelector('#newTwitt').focus();
    document.querySelector('#newTwitt')?.scrollIntoView({ behavior: 'smooth' });
}
async function getFollow(uni_id, req_uni_id) {
    // work on follow unfollow 
    const result = await fetch("/user/follow", {
        method: "POST",
        headers: {
            'content-type': 'application/json'
        },
        body: JSON.stringify({ uni_id, req_uni_id })
    })

    const follow = await result.json();

    if (!result.ok || follow.message === `something went wrong`) {
        alert('something went wrong');
        return;
    } else {
        const btn = document.getElementById('followbtn');
        const val = btn.innerText;
        btn.innerText = val === 'Follow' ? "Unfollow" : "Follow";
        const followbtn = document.getElementById('followerCtn');
        followbtn.innerText = parseInt(follow.totalFollower);
    }
    // I have to remove this (Emitting React Function)
    // window.location.href = `/user/profile/${uni_id}`;   

}

async function deletePost(post_id) {

    const deleteRestult = await fetch(`/twitts/${post_id}/delete`, {
        method: "DELETE"
    });
    const result = await deleteRestult.json();
    if (!deleteRestult.ok || result.error) {
        alert("something went wrong")
        return
    }
    document.location.href = window.location.pathname;
    return
}

async function deleteComment(comment_id) {
    const deleteRestult = await fetch(`/twitts/comments/${comment_id}/delete`, {
        method: "DELETE"
    });
    const result = await deleteRestult.json();
    if (!deleteRestult.ok || result.error) {
        alert("something went wrong")
        return
    }
    document.location.href = window.location.pathname;
    return
}
async function likeUnlikePost(tweet_id, user_id, whichPost) {
    console.log("tweet no: ", tweet_id, "user no: ", user_id);

    const result = await fetch("/twitts/like", {
        method: "POST",
        headers: {
            'content-type': 'application/json'
        },
        body: JSON.stringify({ tweet_id, user_id })
    })

    const like = await result.json();

    if (!result.ok || like?.error) {
        alert('something went wrong');
        return;
    } else {
        // console.log(like.totalLikes);
        const ele = document.getElementById(`liketweetIcn${whichPost}`);
        const ctn = document.getElementById(`liketweetCtn${whichPost}`)
        if (ele.classList.contains("fa-solid")) {
            ele.classList = "fa-regular fa-heart me-2"
            ctn.innerText = like.totalLike;
        } else {
            ele.classList = "fa-solid fa-heart me-2 text-danger"
            ctn.innerText = like.totalLike
        }
    }
}
// likeUnlikeCommnets('550325c4-4a75-4aae-bf58-a2159812addd', '9b936c35-c187-461d-a1c4-43f6eb2e68fa', '1')
async function likeUnlikeCommnets(comment_id, user_id, whichPost) {


    const result = await fetch("/twitts/like/comments", {
        method: "POST",
        headers: {
            'content-type': 'application/json'
        },
        body: JSON.stringify({ comment_id, user_id })
    })

    const like = await result.json();

    if (!result.ok || like?.error) {
        alert('something went wrong');
        return;
    } else {
        // console.log(like.totalLikes);
        const ele = document.getElementById(`likeCommentIcn${whichPost}`);
        const ctn = document.getElementById(`likeCommentCtn${whichPost}`)
        if (ele.classList.contains("fa-solid")) {
            ele.classList = "fa-regular fa-heart me-2"
            ctn.innerText = like.totalLike;
        } else {
            ele.classList = "fa-solid fa-heart me-2 text-danger"
            ctn.innerText = like.totalLike
        }
    }
}

