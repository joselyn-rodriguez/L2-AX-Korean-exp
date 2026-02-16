PennController.ResetPrefix(null);
// PennController.DebugOff();

// Preload("https://raw.githubusercontent.com/ccuonzo/Italian-Latinate-Roots/refs/heads/main")
PreloadZip("https://raw.githubusercontent.com/joselyn-rodriguez/L2-Korean-exp/main/stims-iteration-4/final_stims_test/words.zip") 
CheckPreloaded() // doesn't actually work 

jQuery.prototype.on  = function(...args){ return jQuery.prototype.bind.apply(this, args); };
jQuery.prototype.prop = function(...args){ return jQuery.prototype.attr.apply(this, args); };

if (!window._hcLoading) {
  window._hcLoading = true;
  const tag = document.createElement("script");
  const link = document.createElement("link");
  link.rel = "stylesheet";
  link.type = "text/css";
  link.href = "https://s3.amazonaws.com/mcd-headphone-check/v1.0/src/HeadphoneCheckStyle.css";
  tag.src = "https://s3.amazonaws.com/mcd-headphone-check/v1.0/src/HeadphoneCheck.min.js";
  tag.onload = () => { window._hcReady = true; };
  tag.onerror = () => { window._hcReady = false; };
  document.head.appendChild(tag);
  document.head.appendChild(link);

} 

// Defining functions to be used in script

// The ID is used to name the recording files
function getRandomStr(){
    const LENGTH = 10
    const SOURCE = "ABCDEFGHIJKLMNOPQRSTUVWXYZ123456789"
    let result = ''
    for(let i=0; i<LENGTH; i++){
        result += SOURCE[Math.floor(Math.random() * SOURCE.length)];
  }
  return result
}

// this is to get the separation of blocks 
function SepWithN(sep, main, n) {
    this.args = [sep,main];

    this.run = function(arrays) {
        assert(arrays.length == 2, "Wrong number of arguments (or bad argument) to SepWithN");
        assert(parseInt(n) > 0, "N must be a positive number");
        let sep = arrays[0];
        let main = arrays[1];

        if (main.length <= 1)
            return main
        else {
            let newArray = [];
            while (main.length){
                for (let i = 0; i < n && main.length>0; i++)
                    newArray.push(main.shift());
                for (let j = 0; j < sep.length; ++j)
                    newArray.push(sep[j]);
            }
            return newArray;
        }
    }
}

function sepWithN(sep, main, n) { return new SepWithN(sep, main, n); }

// Generate a subject ID
const subject_id = getRandomStr()

Header( /* void */ )
    // This .log command will apply to all trials
    .log("URL_ID", GetURLParameter("id") ) // Append the "ID" URL parameter to each result line


// sequence of events
PennController.Sequence( 
    "consentform" ,
    "hc-instructions", 
    "headphone-check", 
    "end-hc",
    "main-exp-audio-check", 
    "main-exp-instructions" ,
    randomize("practice"),
    "start" ,
    sepWithN( "break" , randomize("mainTrials"), 100), // this number is manually set depending on how many items there are
    "questionaire",
    "send" ,                 // Notice "send" before "final" --- refers to SendResults below
    "code",
    "final"
    )  
    
//////////////////   consent form //////////////////////////////////////////////////////   
PennController( "consentform" ,
    newHtml("consentformitHTML", "consentformit.html")
      .settings.checkboxWarning("Required")
      .settings.radioWarning("Required")
      .settings.inputWarning("Required")
      .print()
      .log()
    ,
    newButton("I consent")
        .settings.css("margin-bottom","5em")
        .settings.bold()
        .center()
        .print()
        .wait(getHtml("consentformitHTML").test.complete().failure(getHtml("consentformitHTML").warn()))
)
.log( "URL_ID" , PennController.GetURLParameter("id") )
.log("subject_id", subject_id) 
.setOption("hideProgressBar", true)                     

PennController( "hc-instructions" ,
    newHtml("hc-instructions.html")
      .print()
    ,
    newButton("begin headphone check")
        .center()
        .print()
        .wait()
)
.log("URL_ID", PennController.GetURLParameter("id") )     
.setOption("hideProgressBar", true)  

//////////////////   headphone check  //////////////////////////////////
PennController("headphone-check",
  newCanvas("host", 600, 420).center().print(),
  newFunction(() => getCanvas("host")._element.jQueryElement.attr("id","hc-container")).call(),
  newButton("advance", "").css("display", "none").print(),
  newText("status", '').center().print(),

  newFunction(() => {

    function startHC() {

        const handler = function(_e, data){
        getCanvas("host").remove()._runPromises();
        if (data && data.didPass) {
          getButton("advance").click()._runPromises();
        } else {
          getText("status").text("Sorry, you failed the headphone check.Please put on headphones and restart the experiment.")._runPromises();
        }
        jQuery(document).unbind('hcHeadphoneCheckEnd', handler);
      };
      
      jQuery(document).bind('hcHeadphoneCheckEnd', handler);

      window.HeadphoneCheck.runHeadphoneCheck({
        doCalibration: false,
        totalTrials: 6,
        trialsPerPage: 6,
        correctThreshold: 5/6,
        useSequential: true,
        doShuffleTrials: true,
        sampleWithReplacement: true
      });
      getText("status").text("Running… please complete the short check.");
    }

    if (window._hcReady && window.HeadphoneCheck) {
      startHC();
    } else {
      const iv = setInterval(() => {
        if (window._hcReady && window.HeadphoneCheck){
          clearInterval(iv);
          startHC();
        }
      }, 150);
    }
  }).call()
  ,
  getButton("advance").wait()
)
.log("subject_id", subject_id) 
.setOption("hideProgressBar", true)

PennController("end-hc",
  newText("done", "Headphone check complete!").center().print(),
  newButton("continue", "Continue").center().print().wait()
)

//////////////////  audio check  //////////////////////////////////////////////////////   
PennController( "main-exp-audio-check" ,
    newHtml("main-exp-audio-check.html")
      .print()
    ,
    newButton("begin experiment")
        .center()
        .print()
        .wait()
)
.log("URL_ID", PennController.GetURLParameter("id") )     
.setOption("hideProgressBar", true)  


////////////////// main experiment instructions //////////////////////////////////////////////////////   
PennController( "main-exp-instructions" ,
    newHtml("main-exp-instructions.html")
      .print()
    ,
    newKey("press3","3").wait()
)
.log("URL_ID", PennController.GetURLParameter("id") )     
.setOption("hideProgressBar", true)

//////////////////  practice trials  //////////////////////////////////////////////////////   
PennController.Template( "practice.csv" ,
    row => PennController( "practice" ,              // all these trials will be labeled 'practice' (see Sequence above)
        newText("F", "방")                           // We create the Text elements in cache (not printed yet)
            .settings.bold()
            .settings.css("font-size", "3em")
        ,
        newText("J", "빵")
            .settings.bold()
            .settings.css("font-size", "3em")
        ,
        newAudio("target", row.Filename)
            .settings.log("play","end")
            .play()
        ,
        getAudio("target")
            .wait()
        ,
        newCanvas("text", 500, 500)    // was 500 100
            .settings.center()
            .settings.add( 0 , 200 ,  getText("F") )
            .settings.add( 450 , 200 ,  getText("J") )    // aligned to the right edge
            .print()                                    // Prints the Canvas along with its Text elements
        ,
        newKey("answer", "FJ")  // Respond by pressing F or J key
            .settings.log("all")
            .wait()
            .setVar("keyPressedtarget")
        ,
        clear()
        ,
        newVar("keyPressedtarget", "None")       
            .settings.global()
            .set( getKey("answer") )  // This logs what the answer was
        ,
        newTimer("ISI", 500)
            .start()
            .wait()
        ,
    )
    .log("URL_ID" , PennController.GetURLParameter("id") )
    .log("subject_id", subject_id)
    .log("TargetSoundfile" , row.Filename )
    .log("KeyPressedTarget" , getVar("keyPressedtarget") )  // key press target   
    .log("ActualTarget", row.Answer)
    .log("Filename", row.Filename)
)

PennController( "start" ,
    newHtml("startit.html")
      .print()
    ,
    newKey("press7","7").wait()
)
.setOption("hideProgressBar", true)

//////////////////  main trials  //////////////////////////////////////////////////////   
PennController.Template( "stimuli.csv" ,
    row => PennController( "mainTrials" ,           // These trials will be labeled from the BlockNum column; starting with the first block.
        newVar("TrialN", 0)
             .settings.global()
             .set(v => v+1 )
        ,
        newText("fixation", "+")                       // We create the Text elements in cache (not printed yet)
            .settings.bold()
            .settings.css("font-size", "3em")
        ,

        newAudio("A", row.Filename)
            .settings.log("play","end")
            .play()
        ,
        getAudio("A")
            .wait()
        ,
        
        newTimer("ISI", 500)          // setting ISI to 500ms
            .start()
            .wait()
        ,
        
        newAudio("X", row.Filename)
            .settings.log("play","end")
            .play()
        ,
        getAudio("X")
            .wait()
        ,
        
        newCanvas("text", 500, 100) 
            .settings.center()
            .settings.add( 0 , 200 ,  getText("F") )
            .settings.add( 450 , 200 ,  getText("J") )    // aligned to the right edge
            .print()                                      // Prints the Canvas along with its Text elements
        ,

        newKey("answer", "FJ")  // Respond by pressing F or J key
            .settings.log("all")
            .wait()
            .setVar("keyPressedtarget")
        ,
        clear()
        ,
            
        newVar("keyPressedtarget", "None")       
            .settings.global()
            .set( getKey("answer") )  // This logs what the answer was
        ,
        newTimer("ISI", 500)          // setting ISI to 500ms
            .start()
            .wait()
        ,
    )
    .log("URL_ID" , PennController.GetURLParameter("id") )
    .log("subject_id", subject_id)
    .log("TargetSoundfile" , row.Filename )
    .log("KeyTarget" , getVar("keyPressedtarget") )  // key press target    
    .log("TrialN", getVar("TrialN"))
    .log("Filename", row.Filename)
    .log("FricDur", row.FricDur)
    .log("AspDur", row.AspDur)
    .log("V_Afil", row.V_Afil)
    .log("C_Afil", row.C_Afil)
)

//////////////////  break  //////////////////////////////////////////////////////   
PennController( "break" ,
      newText("Please feel free to take a short break before starting the next block. Press the button below when you're ready to continue")
        .settings.bold()
        .print()
      ,
      newButton("I'm ready to start again!")
        .center()
        .print()
        .wait()
)

//////////////////  ending questionnaire  //////////////////////////////////////////////////////   
PennController( "questionaire" ,
    newHtml("questionaireitHTML", "questionaireit.html")
      .print()
      .settings.radioWarning("Required")
      .settings.inputWarning("Required")
      .settings.log() // this logs the answers in the html file
    ,
    newButton("Click here to submit your results")
        .settings.css("margin-bottom","5em")
        .center()
        .print()
        .wait(getHtml("questionaireitHTML").test.complete().failure(getHtml("questionaireitHTML").warn()))
)
.log("URL_ID", PennController.GetURLParameter("id") )     
.log("subject_id", subject_id)
.setOption("hideProgressBar", true)                     // We don't show the progress bar for this trial

//////////////////  send results (code) //////////////////////////////////////////////////////   
PennController.SendResults("send")

newTrial("code", exitFullscreen(), newHtml("Prolific_code.html").print().wait());

//////////////////  final eternal screen  //////////////////////////////////////////////////////   
PennController( "final" ,
    newHtml("final-screen.html")
      .print()
    ,
    newTimer("finalTimer",1)
        .wait()                 // This will wait forever, because the Timer was never started
)
.setOption("countsForProgressBar", false)



