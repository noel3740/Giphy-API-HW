$(document).ready(function() {

    var giphyDemo = {
        tempTopics: [],
        tempButtonsDiv: null,
        tempGifDisplayDiv: null,
        topicIndexAttribName: "topic-index",
        giphyAPIKey: "BhEB2InhZbmP96xsZoWBz15voVYxA47a", 

        initialize: function (searchTopics, buttonsDiv, gifDisplayDiv) {
            this.tempTopics = [...searchTopics];
            this.tempButtonsDiv = buttonsDiv;
            this.tempGifDisplayDiv = gifDisplayDiv;
        },

        createTopicButtons: function() {
            this.tempButtonsDiv.empty();
            
            this.tempTopics.forEach((topic, index) => {
                var topicLabel = $("<label>").addClass("btn btn-primary").attr(this.topicIndexAttribName, index);
                var topicButton = $("<input>").attr({"type": "radio", "name": "topic-options", "autocomplete": "off"});
                topicLabel.append(topicButton);
                topicLabel.append(" " + topic);
                this.tempButtonsDiv.append(topicLabel);

                topicLabel.on("click", this.topicButtonClicked);
            });
        },

        topicButtonClicked: function() {

            //Get the index in the array of the button the user clicked on by grabbing it from the topic-index attribute on the button
            var topicIndex = $(this).attr(giphyDemo.topicIndexAttribName);
            //Get the string to search the Giphy API for using the index of the button the user clicked and replace spaces with a plus sign. 
            var searchFor = topics[topicIndex].replace(/ /gi, "+");
            //Get a random offset to get random pictures
            var randomOffset = Math.floor(Math.random() * 100) + 1;
            //Clear out the gif display div
            giphyDemo.tempGifDisplayDiv.empty();
             
            //Build the query url
            var queryURL = `https://api.giphy.com/v1/gifs/search?api_key=${giphyDemo.giphyAPIKey}&q=${searchFor}&offset=${randomOffset}&limit=10&lang=en`;

            //send a get request to the giphy url then build the gif image elements on the page. 
            $.ajax({
              url: queryURL,
              method: "GET"
            }).then(giphyDemo.buildGifImages);
           
        },

        buildGifImages: function(giphyResponse) {
            console.log(giphyResponse);

            giphyResponse.data.forEach((giphyDataObject) => {
                var originalStillImage = giphyDataObject.images.downsized_still;
                var original = giphyDataObject.images.downsized;

                var gifImageDiv = $("<div>").addClass("m-2 gifImageContainer");
                gifImageDiv.on("click", giphyDemo.toggleGifAnimation);

                var giphyStillImage = $("<img>").attr("src", originalStillImage.url).attr({ "height": originalStillImage.height, "width": originalStillImage.width});
                gifImageDiv.append(giphyStillImage);

                var giphyAnimatedImage = $("<img>").attr("src", original.url).attr({ "height": original.height, "width": original.width});
                giphyAnimatedImage.hide();
                gifImageDiv.append(giphyAnimatedImage);

                giphyDemo.tempGifDisplayDiv.append(gifImageDiv);
            });
        },

        toggleGifAnimation: function() {
            $(this).find("img").toggle();
        }
    }

    var topics = ["dog", "cat", "frog", "turtle", "bird", "hampster", "goat", "skunk", "badger", "racoon", "snake", "honey badger"];
    giphyDemo.initialize(topics, $("#searchButtonsDiv"), $("#gifDisplayDiv"));
    giphyDemo.createTopicButtons();
});