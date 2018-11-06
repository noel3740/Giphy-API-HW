$(document).ready(function() {

    var giphyDemo = {
        tempTopics: [],
        favorites: [],
        tempButtonsDiv: null,
        tempGifDisplayDiv: null,
        tempSearchForm: null,
        tempFavDiv: null,
        tempSearchDiv: null,
        topicIndexAttribName: "topic-index",
        giphyAPIKey: "BhEB2InhZbmP96xsZoWBz15voVYxA47a", 
        favoriteListLocalStorageName: "favoritesList",

        //Function to intiialize variables and state of application
        initialize: function (searchTopics, buttonsDiv, gifDisplayDiv, searchForm, favDiv, searchDiv) {
            
            if (localStorage.getItem(this.favoriteListLocalStorageName)) {
                this.favorites = JSON.parse(localStorage.getItem(this.favoriteListLocalStorageName));  
            } 
            else {
                this.favorites = [];
            }

            this.tempTopics = [...searchTopics];
            this.tempButtonsDiv = buttonsDiv;
            this.tempGifDisplayDiv = gifDisplayDiv;
            this.tempSearchForm = searchForm;
            this.tempFavDiv = favDiv;
            this.tempSearchDiv = searchDiv;
            this.tempSearchForm.find("button").on("click", this.onSearchAddClick);

            //Add on click events for nav bar links
            $(".favoritesLink").on("click", () => 
            { 
                $(".favoritesLink").addClass("active");
                $(".searchLink").removeClass("active");

                giphyDemo.tempSearchDiv.hide(); 
                giphyDemo.tempFavDiv.show(); 
                giphyDemo.buildFavoritesScreen();

                if ($('.navbar-toggler').css('display') != "none") {
                    $('.navbar-toggler').click();
                }
            });

            $(".searchLink").on("click", () => 
            { 
                giphyDemo.tempGifDisplayDiv.empty();
                giphyDemo.tempButtonsDiv.find(".active").removeClass("active");

                $(".favoritesLink").removeClass("active");
                $(".searchLink").addClass("active");
                giphyDemo.tempSearchDiv.show(); 
                giphyDemo.tempFavDiv.hide(); 

                if ($('.navbar-toggler').css('display') != "none") {
                    $('.navbar-toggler').click();
                }
            });

            //As default show the search section and hide the favorites section
            this.tempSearchDiv.show();
            this.tempFavDiv.hide();
        },

        createTopicButtons: function() {
            giphyDemo.tempButtonsDiv.empty();
            
            giphyDemo.tempTopics.forEach((topic, index) => {
                var topicLabel = $("<label>")
                    .addClass("btn btn-primary")
                    .attr(giphyDemo.topicIndexAttribName, index);
                    
                var topicButton = $("<input>")
                    .attr({
                            "type": "radio", 
                            "name": "topic-options",
                            "autocomplete": "off"
                        });

                topicLabel.append(topicButton);
                topicLabel.append(" " + topic.toLowerCase());
                giphyDemo.tempButtonsDiv.append(topicLabel);

                topicLabel.on("click", giphyDemo.topicButtonClicked);
            });
        },

        //Function that will build out the favorites screen using jQuery
        buildFavoritesScreen: function() {

            var displayDiv = giphyDemo.tempFavDiv.find(".favDisplayDiv");
            //Clear out current display div contents
            displayDiv.empty();

            if (giphyDemo.favorites.length > 0) {
                //Build the query url
                var queryURL = `https://api.giphy.com/v1/gifs?api_key=${giphyDemo.giphyAPIKey}&ids=${giphyDemo.favorites.join(",")}`;

                //send a get request to the giphy url then build the gif image elements on the page. 
                $.ajax({
                url: queryURL,
                method: "GET"
                }).then((giphyResponse) => giphyDemo.createGifCardElements(giphyResponse, displayDiv));
            }
        },

        createGifCardElements: function (giphyResponse, contentDiv) {

            giphyResponse.data.forEach((giphyDataObject) => {
                var originalStillImage = giphyDataObject.images.fixed_height_still;
                var original = giphyDataObject.images.fixed_height;

                var gifImageCard = $("<div>")
                                    .addClass("card m-2")
                                    .css("width", originalStillImage.width)
                                    .attr("data-giphy-id", giphyDataObject.id);

                var gifDiv = $("<div>").addClass("gifImageContainer");
                gifDiv.on("click", giphyDemo.toggleGifAnimation);

                var giphyStillImage = $("<img>")
                    .attr({
                        "src": originalStillImage.url, 
                        "alt": giphyDataObject.title,
                        "height": originalStillImage.height,
                        "width": originalStillImage.width
                        })
                    .addClass("card-img-top");

                gifDiv.append(giphyStillImage);

                var giphyAnimatedImage = $("<img>")
                    .attr({
                            "src": original.url, 
                            "alt": giphyDataObject.title,
                            "height": original.height, 
                            "width": original.width
                        })
                    .addClass("card-img-top");
                    
                giphyAnimatedImage.hide();
                gifDiv.append(giphyAnimatedImage);

                gifImageCard.append(gifDiv);

                //Create the card body
                var cardBody = $("<div>").addClass("card-body");

                //Create header element with the card title
                cardBody.append($("<h5>")
                    .addClass("card-title")
                    .text(giphyDataObject.title.toUpperCase()));

                //Create paragraph element that contains the card text
                cardBody.append($("<p>")
                    .addClass("card-text")
                    .text(`Rated ${giphyDataObject.rating.toUpperCase()}`));

                //Add a download button to the card div
                var downloadButton = $("<button>")
                        .addClass("btn btn-secondary downloadGifButton")
                        .attr("download-url", original.url);

                downloadButton.append($("<i>")
                        .addClass("fa fa-download"));
                
                downloadButton.append(" Download");

                //Attach click event to download buttons
                downloadButton.on("click", (event) => giphyDemo.forceDownload($(event.currentTarget).attr("download-url")));

                cardBody.append(downloadButton);
                
                //Add favorite icon
                var favoriteIconClass = (giphyDemo.favorites.indexOf(giphyDataObject.id) >= 0 ? "fas fa-heart favorite" : "far fa-heart favorite");

                var favIcon = $("<i>")
                    .addClass(favoriteIconClass)
                    .attr("data-giphy-id", giphyDataObject.id);
                
                //Attach click event to favorite icon
                favIcon.on("click", (event) => giphyDemo.addRemoveFavorite($(event.currentTarget)));
                
                cardBody.append(favIcon);                

                //Append the card body to the card
                gifImageCard.append(cardBody);
                //Prepend the card to the display div
                contentDiv.prepend(gifImageCard);
            });

            
        },

        topicButtonClicked: function() {

            //Get the index in the array of the button the user clicked on by grabbing it from the topic-index attribute on the button
            var topicIndex = $(this).attr(giphyDemo.topicIndexAttribName);
            //Get the string to search the Giphy API for using the index of the button the user clicked and replace spaces with a plus sign. 
            var searchFor = giphyDemo.tempTopics[topicIndex].replace(/ /gi, "+");
            //Get a random offset to get random pictures
            var randomOffset = Math.floor(Math.random() * 100) + 1;
             
            //Build the query url
            var queryURL = `https://api.giphy.com/v1/gifs/search?api_key=${giphyDemo.giphyAPIKey}&q=${searchFor}&offset=${randomOffset}&limit=10&lang=en`;

            //send a get request to the giphy url then build the gif image elements on the page. 
            $.ajax({
              url: queryURL,
              method: "GET"
            }).then((giphyResponse) => giphyDemo.createGifCardElements(giphyResponse, giphyDemo.tempGifDisplayDiv));
           
        },

        addRemoveFavorite: function (favoriteIconElement) {

            favoriteIconElement.removeClass();

            var gifID = favoriteIconElement.attr("data-giphy-id");
            var indexOfFav = giphyDemo.favorites.indexOf(gifID);

            console.log(indexOfFav);

            //Gif alread exists in favorites to remove it
            if (indexOfFav >= 0) {
                giphyDemo.favorites.splice(indexOfFav, 1);
                favoriteIconElement.addClass("far fa-heart favorite");
                giphyDemo.tempFavDiv.find(`.card[data-giphy-id="${gifID}"]`).remove();
            }
            //Gif does not exist in favorites so add it
            else {
                giphyDemo.favorites.push(gifID);
                favoriteIconElement.removeClass();
                favoriteIconElement.addClass("fas fa-heart favorite");
            }

            localStorage.setItem(giphyDemo.favoriteListLocalStorageName, JSON.stringify(giphyDemo.favorites));
        },

        //Toggle between the animated and still image. 
        toggleGifAnimation: function() {
            $(this).find("img").toggle();
        },

        //Function is run when the add search button is clicked
        onSearchAddClick: function () {
            event.preventDefault();
            var inputElement = giphyDemo.tempSearchForm.find("input");

            if (inputElement.val().trim() &&
                giphyDemo.tempTopics.indexOf(inputElement.val().toLowerCase()) < 0) {

                giphyDemo.tempTopics.push(inputElement.val().toLowerCase());
                giphyDemo.createTopicButtons();
            }

            inputElement.val("");
        }, 

        //Fuction will force download of url provided
        forceDownload: function (url){
            var xhr = new XMLHttpRequest();
            xhr.open("GET", url, true);
            xhr.responseType = "blob";
            xhr.onload = function(){
                var urlCreator = window.URL || window.webkitURL;
                var imageUrl = urlCreator.createObjectURL(this.response);
                var tag = document.createElement('a');
                tag.href = imageUrl;
                tag.download = "";
                document.body.appendChild(tag);
                tag.click();
                document.body.removeChild(tag);
            }
            xhr.send();
        }
    }

    var topics = ["baseball", "football", "basketball", "soccer", "hockey", "skateboarding", "surfing", 
    "tennis", "golf", "volleyball", "ping pong", "rugby", "boxing", "gymnastics", "Field Hockey "];

    giphyDemo.initialize(topics, $("#searchButtonsDiv"), $("#gifDisplayDiv"), $("#gifAddForm"), $("#favoritesMainSection"), $("#searchMainSection"));
    giphyDemo.createTopicButtons();
});