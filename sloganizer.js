;(function(global){
	// UglifyJS define hack.  Used for unit testing.
	if (typeof SLOGANIZER_NOW === 'undefined') {
	  SLOGANIZER_NOW = function () {
	    return +new Date();
	  };
	}

	if (typeof SLOGANIZER === 'undefined') {
	  var global = (function(){return this;})();
	}


	//************
	//LOGIC HERE
	var sloganizer= function(options){
		var defaults = {
			$el: '',
			wheelWordCount:6,
			wordBanks:'',
			initialSentenceArray: ['Which','cat','is','good?']
		};
		this.settings = $.extend({}, defaults, options);
		this.wordHeight = 0;
		this.currentSentenceObj = {
			sentence: '',
			$el: $(),
			wordBankObjs: []
		};
		this.wordBankObjs = [];
		this.clones=$();

		this.initialize()
		
		
	};
	sloganizer.prototype.formulateWheelsAndSentence = function(wheelLength){
		var self = this;
		var sentenceArray = [];
		for(var j = 0; j<this.wordBankObjs.length; j++){
			this.wordBankObjs[j].$el.children().remove()
		}
		for(var i = 0; i<wheelLength; i++){//need to swap this loop with the one below somehow, and integrate the loop above into the mess.
			for(var j = 0; j<this.wordBankObjs.length; j++){
				var wordBankObj = self.wordBankObjs[j];
				this.wordBankObjs[j].wheelLengthXXX = (wheelLength-(Math.round(wheelLength/6)*(this.wordBankObjs.length - j)));
				if(i === this.wordBankObjs[j].wheelLengthXXX - 1){//For the last iteration, make sure it's not a repeat, and update sentence object
					if(this.currentSentenceObj.wordBankObjs[j] === wordBankObj.currentSentenceAssignedWordObj){
						wordBankObj.currentSentenceAssignedWordObj = self.returnRandomWordObj(self.wordBankObjs[j])
					}
					var $nonClone = this.wordBankObjs[j].currentSentenceAssignedWordObj.$el
					this.wordBankObjs[j].$el.append($nonClone)
					sentenceArray[j] = this.wordBankObjs[j].currentSentenceAssignedWordObj.word;
					this.currentSentenceObj.wordBankObjs[j] = this.wordBankObjs[j].currentSentenceAssignedWordObj;
				} else {
					if(i < this.wordBankObjs[j].wheelLengthXXX - 1){
						var $clone = this.wordBankObjs[j].currentSentenceAssignedWordObj.$el.clone()
						this.wordBankObjs[j].$el.append($clone)
						this.clones.push($clone);
						wordBankObj.currentSentenceAssignedWordObj = self.returnRandomWordObj(self.wordBankObjs[j])
					}
				}
			}			
		}
		var sentenceX = sentenceArray.join('');
		this.currentSentenceObj.sentence = sentenceX;
	}
	sloganizer.prototype.returnRandomWordObj = function(wordBankObj){
		var self = this;
		var newIndex = 0;
		var wordObjs = wordBankObj.wordObjs;
		var currentWordObjIndex = wordBankObj.wordObjs.indexOf(wordBankObj.currentBankAssignedWordObj)
		if(wordObjs.length === 1){

		} else 
		if(wordObjs.length === 2){
			newIndex = currentWordObjIndex ===0 ? 1 : 0;
		} else {
			var randomIndex = Tools.math.returnRandomInt(0,wordObjs.length - 1);
			if(randomIndex === currentWordObjIndex){
				randomIndex += 1;
				if(randomIndex > wordObjs.length - 1){
					randomIndex += -2;
				}
			}
			
			newIndex = randomIndex;
		}
		var indexedWordObj = wordObjs[newIndex]
		wordBankObj.currentBankAssignedWordObj = indexedWordObj;
		return indexedWordObj;
	}
	sloganizer.prototype.lateralAnimation = function(){
		var self = this;
	}
	sloganizer.prototype.insertWheelsAnimateAndResolveSentence = function(){
		var self = this;
		var callbackCount = 0;
		for(var j = 0; j<this.wordBankObjs.length; j++){
			self.settings.$el.append(self.wordBankObjs[j].$el)
			Tools.dom.cssTransitioner2({
				target: self.wordBankObjs[j].$el,
				cssProperty: Tools.dom.translate3dKey,
				cssValue: {
					type:'translate3d',
					values:[0,-(this.wordBankObjs[j].wheelLengthXXX - 1)*this.wordHeight,0]
				},
				duration: 500,
				ease: 'ease-out',
				duration:this.wordBankObjs[j].wheelLengthXXX * 110,
				callback: function($that){
					if(callbackCount === self.wordBankObjs.length - 1){
						for(var k = 0, n = self.clones.length; k < n; k++){
							self.clones[k].remove()
						}
						var $tempWheelContainer = $('<div style="position:absolute;opacity:0;"></div>');
						self.settings.$el.append($tempWheelContainer);
						var compactSentenceWidth = 0;
						var fullWidth = 0;
						var sentence = '';
						for(var k = 0, n = self.wordBankObjs.length; k < n; k++){
							
							sentence += self.wordBankObjs[k].currentWord;
							fullWidth += (self.wordBankObjs[k].widestWordWidth);
							compactSentenceWidth += self.wordBankObjs[k].currentSentenceAssignedWordObj.width;
							self.wordBankObjs[k].$el.css({'top':'0'})
							var $tempWheel = self.wordBankObjs[k].$el.clone();
							$tempWheel.css('width','')
							$tempWheelContainer.append($tempWheel)
							self.wordBankObjs[k].horizontalShift = $tempWheel.offset().left - self.wordBankObjs[k].currentSentenceAssignedWordObj.$el.offset().left;
						}
						var shiftMiddleAdjustValue = (fullWidth - compactSentenceWidth)/2;
						$tempWheelContainer.remove();

						var callbackCount2 = 0;
						for(var k = 0, n = self.wordBankObjs.length; k < n; k++){
							Tools.dom.cssTransitioner2({
								target: self.wordBankObjs[k].$el,
								cssProperty: Tools.dom.translate3dKey,
								cssValue: {
									type:'translate3d',
									values:[self.wordBankObjs[k].horizontalShift + shiftMiddleAdjustValue,0,1]
								},
								duration: 500,
								ease: 'ease-out',
								duration:1000,
								callback: function($that){
									if(callbackCount2 === n - 1){
										self.currentSentenceObj.$el = $('<div style="position:absolute;top:0;z-index:9999;width:'+fullWidth+'px;text-align:center;">'+self.currentSentenceObj.sentence+'</div>');
										self.settings.$el.prepend(self.currentSentenceObj.$el)
										for(var a = 0, z = self.wordBankObjs.length; a < z; a++){
											self.wordBankObjs[a].$el.remove();
											self.wordBankObjs[a].$el.css('left','0');

											reprimeWordObjsArrayForCurrent(self.wordBankObjs[a])
											function reprimeWordObjsArrayForCurrent(wordBankObj){
												var index = wordBankObj.wordObjs.indexOf(wordBankObj.currentSentenceAssignedWordObj)
												var currentTempRemoved = self.wordBankObjs[a].wordObjs.splice(index, 1);
												wordBankObj.wordObjs.unshift(currentTempRemoved[0])
												
											}
											console.log(self.wordBankObjs[a].wordObjs[0])
											//SECOND SPIN
											//SECOND SPIN
											//SECOND SPIN
											//SECOND SPIN
											//SECOND SPIN
											console.log(self.wordBankObjs[a].currentBankAssignedWordObj,self.wordBankObjs[a].currentSentenceAssignedWordObj)
											setTimeout(function(){
												//self.currentSentenceObj.$el.remove()
												self.formulateWheelsAndSentence(25)
												//self.insertWheelsAnimateAndResolveSentence()
											},1000)
											

										}
									}
									callbackCount2++;
								}
							});
						}
					} else {

					}
					callbackCount ++;
				}
			});
		}
	}
	sloganizer.prototype.summonWheels = function(wheelLength){
		var self = this;
		this.currentSentenceObj.$el.remove()
		
		self.formulateWheelsAndSentence(wheelLength)
		self.insertWheelsAnimateAndResolveSentence()

		
	};
	sloganizer.prototype.returnWordObj = function(word,isEndOfSentence,$wheel){
		var self = this;
		var wordClean = word;
		if(!isEndOfSentence){
			word += '&nbsp;';
		}
		var $word = $('<div class="sloganizerWord" style="float:left;clear:both;margin:0 auto;opacity:0;">'+word+'</div>');
		$wheel.append($word)
		if(self.wordHeight === 0){
			self.wordHeight = $word.outerHeight();
		}
		if(self.wordHeight === 0){
			self.wordHeight = $word.outerHeight();
		}
		var wordWidth = $word.outerWidth();
		$word.remove();
		$word.css({
			'float':'none',
			'width':wordWidth+'px',
			'opacity':''
		})
		return {
			$el:$word,
			word:word,
			width:wordWidth
		}

	}
	sloganizer.prototype.initialize = function(){
		var self = this;
		
		self.wordHeight = 0;
		
		for(var i = 0, l = this.settings.wordBanks.length; i<l; i++){
			var isEndOfSentence = l - i === 1 ? true : false;
			var $wheel = $('<div class="sloganizerWheel" style="float:left;position:relative;"></div>');
			this.settings.$el.append($wheel);
			var widestWord = 0;
			var wordObjs =[];
			var intitialWordObj = self.returnWordObj(self.settings.initialSentenceArray[i],isEndOfSentence,$wheel);
			widestWord = intitialWordObj.width;
			wordObjs.push(intitialWordObj)

			this.currentSentenceObj.wordBankObjs[i] = intitialWordObj;

			for(var j = 0, m = this.settings.wordBanks[i].length; j<m; j++){
				var word = (this.settings.wordBanks[i][j]);
				var wordObj = self.returnWordObj(word,isEndOfSentence,$wheel);
				wordObjs.push(wordObj)
				if(wordObj.width > widestWord){
					widestWord = wordObj.width;
				}
			}
			$wheel.css({
				'width':widestWord+'px'
				//'height':(this.settings.wordBanks[i].length * wordHeight)+'px',
			});
			this.wordBankObjs.push({
				$el:$wheel,
				widestWordWidth: widestWord,
				wordObjs:wordObjs,
				wordBank:this.settings.wordBanks[i],
				currentSentenceAssignedWordObj:intitialWordObj,
				currentBankAssignedWordObj:intitialWordObj,
				dyingWordObj:null,
				currentWord:intitialWordObj.word,
			})
			$wheel.remove()
			
			this.settings.$el.css({
				'height':this.wordHeight + 'px',
				'overflow':'hidden'
			});
			
		}
	}
	

	





	var sloganizerBootstraper = function(){};
	sloganizerBootstraper.prototype.createSloganizer = function(arguments){
		return new sloganizer(arguments)
	}

	var Sloganizer = new sloganizerBootstraper();
	//return objInstance;

	if (typeof exports === 'object') {
		// nodejs
		module.exports = Sloganizer;
	} else if (typeof define === 'function' && define.amd) {
		// AMD
		define(function () { return Sloganizer; });
	} else if (typeof global.Sloganizer === 'undefined') {
		// Browser: Make `Tweenable` globally accessible.
		global.Sloganizer = Sloganizer;
	}

	return Sloganizer;


})(this);