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
            
            //Get the list of favorites from local storage if it exists. If not then default to a blank array
            if (localStorage.getItem(this.favoriteListLocalStorageName)) {
                this.favorites = JSON.parse(localStorage.getItem(this.favoriteListLocalStorageName));  
            } 
            else {
                this.favorites = [];
            }

            //Assign object variables
            this.tempTopics = [...searchTopics];
            this.tempButtonsDiv = buttonsDiv;
            this.tempGifDisplayDiv = gifDisplayDiv;
            this.tempSearchForm = searchForm;
            this.tempFavDiv = favDiv;
            this.tempSearchDiv = searchDiv;

            //Attach on click event to add search button
            this.tempSearchForm.find("button").on("click", this.onSearchAddClick);

            //Add on click event for favorite link on the nav bar
            $(".favoritesLink").on("click", () => 
            { 
                //Add active class tp favorites link and remove the active class from the search link
                $(".favoritesLink").addClass("active");
                $(".searchLink").removeClass("active");

                //Hide the search div and display the favorite div
                giphyDemo.tempSearchDiv.hide(); 
                giphyDemo.tempFavDiv.show(); 

                //Build the elements on the favorites screen
                giphyDemo.buildFavoritesScreen();

                //If the hamburger menu button is visible then trigger an on click event on that button so it closes the hamburger menu
                if ($('.navbar-toggler').css('display') != "none") {

                    if ($(".navbar-collapse").hasClass("show")) {
                        $('.navbar-toggler').click();
                    }
                }
            });

            //Add on click event for search link on the nav bar
            $(".searchLink").on("click", () => 
            { 
                //Clear the gif display div and remove the active class from the search buttons
                giphyDemo.tempGifDisplayDiv.empty();
                giphyDemo.tempButtonsDiv.find(".active").removeClass("active");

                //Remove active class from favorites link and add the active class to the search link
                $(".favoritesLink").removeClass("active");
                $(".searchLink").addClass("active");

                //Display the search div and hide the favorite div
                giphyDemo.tempSearchDiv.show(); 
                giphyDemo.tempFavDiv.hide(); 

                //If the hamburger menu button is visible then trigger an on click event on that button so it closes the hamburger menu
                if ($('.navbar-toggler').css('display') != "none") {

                    if ($(".navbar-collapse").hasClass("show")) {
                        $('.navbar-toggler').click();
                    }
                }
            });

            //As default show the search section and hide the favorites section
            this.tempSearchDiv.show();
            this.tempFavDiv.hide();

            //Create search buttons
            this.createSearchButtons();
        },

        //Function to create the search buttons
        createSearchButtons: function() {

            //Empty the div that holds the current search buttons
            giphyDemo.tempButtonsDiv.empty();
            
            //Loop through all the topics in the topic array, 
            //create a button for each, and attach on click event to it
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

                topicLabel.on("click", giphyDemo.searchButtonClicked);
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

                //send a get request to the giphy url then build the gif card elements on the page. 
                $.ajax({
                url: queryURL,
                method: "GET"
                }).then((giphyResponse) => giphyDemo.createGifCardElements(giphyResponse, displayDiv));
            }
        },

        //Function that creates card elements in the content div
        createGifCardElements: function (giphyResponse, contentDiv) {

            //Loop through all the objects in the giphy response
            giphyResponse.data.forEach((giphyDataObject) => {

                //Get the fixed height still image and animated image objects
                var originalStillImage = giphyDataObject.images.fixed_height_still;
                var original = giphyDataObject.images.fixed_height;

                //Create card div for gif
                var gifImageCard = $("<div>")
                                    .addClass("card m-2")
                                    .css("width", originalStillImage.width)
                                    .attr("data-giphy-id", giphyDataObject.id);

                //Create container for the image elements and attach an on click event to it that will toggle
                //the still vs animated image
                var gifDiv = $("<div>").addClass("gifImageContainer");
                gifDiv.on("click", giphyDemo.toggleGifAnimation);

                //Create image element for the still image
                var giphyStillImage = $("<img>")
                    .attr({
                        "src": originalStillImage.url, 
                        "alt": giphyDataObject.title,
                        "height": originalStillImage.height,
                        "width": originalStillImage.width
                        })
                    .addClass("card-img-top");

                gifDiv.append(giphyStillImage);

                //Create image element for the animated image
                var giphyAnimatedImage = $("<img>")
                    .attr({
                            "src": original.url, 
                            "alt": giphyDataObject.title,
                            "height": original.height, 
                            "width": original.width
                        })
                    .addClass("card-img-top");

                gifDiv.append(giphyAnimatedImage);
                    
                //Hide the animated image by default
                giphyAnimatedImage.hide();

                //Add the image container to the card div
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

        //Function that will run when a search button is clicked
        searchButtonClicked: function() {

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

        //Function to run when a favorite icon is clicked
        addRemoveFavorite: function (favoriteIconElement) {

            favoriteIconElement.removeClass();

            var gifID = favoriteIconElement.attr("data-giphy-id");
            var indexOfFav = giphyDemo.favorites.indexOf(gifID);

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

            //Add the favorites array to local storage
            localStorage.setItem(giphyDemo.favoriteListLocalStorageName, JSON.stringify(giphyDemo.favorites));
        },

        //Toggle between the animated and still image. 
        toggleGifAnimation: function() {
            $(this).find("img").toggle();
        },

        //Function is run when the add search button is clicked
        onSearchAddClick: function () {
            
            //Prevent screen refresh on submit
            event.preventDefault();

            //Get text input element from the search form
            var inputElement = giphyDemo.tempSearchForm.find("input");

            //The input elemnt has a value and that value does not already exist in the list of search topic that already exist
            if (inputElement.val().trim() &&
                giphyDemo.tempTopics.indexOf(inputElement.val().trim().toLowerCase()) < 0) {

                //Add the element to the topics array
                giphyDemo.tempTopics.push(inputElement.val().trim().toLowerCase());

                //Re-create the search buttons
                giphyDemo.createSearchButtons();
            }

            //Clear out the value in the text input element
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

    //Assign default list of gif search topics
    var topics = ["baseball", "football", "basketball", "soccer", "hockey", "skateboarding", "surfing", 
    "tennis", "golf", "volleyball", "ping pong", "rugby", "boxing", "gymnastics", "Field Hockey "];

    //Initialize the giphy demo object
    giphyDemo.initialize(topics, $("#searchButtonsDiv"), $("#gifDisplayDiv"), $("#gifAddForm"), $("#favoritesMainSection"), $("#searchMainSection"));
});