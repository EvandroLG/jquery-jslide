/*
	Plugn jSlide
	Funcionalidades:
	- Setar elementos por página
	- Paginação
	- Efeito de transação
	- Horizontal e vertical
	- AutoScroll
	- Ajax com JSON
	@param Object
	@return undefined
	@author Evandro L. Gonçalves
*/
(function($){
	$.fn.jSlide = function(options){
		var
			settings = {
				elemByPages: 1,
				pagination: true,
				effect: true,
				vertical: false,
				autoScroll: 0,
				ajax: null // .json, .js 
			};

		options = $.extend(settings, options);
		
		var	Methods = {
			actual: null,
			countElem: null,
			btnNext: null,
			btnPrev: null,
			elemWeight: null,
			fncAutoScroll: null,
			page: 1,

			/*
				Método construtor que inicializa os métodos e atributos do Objeto
				@return undefined
				@author Evandro L. Gonçalves
			*/
			init: function(current){
				var ajax = options.ajax === null ? false : true;
				this.actual = current;
				this.countElem = Math.ceil(this.actual.find(".slide li").size() / options.elemByPages);
				this.btnNext = this.actual.find(".btnNext");
				this.btnPrev = this.actual.find(".btnPrev");
				this.elemWeight = options.vertical ? this.actual.find(".slide li").height() : this.actual.find(".slide li").width();
				
				this.begin(ajax, false);
				this.ajax();
			},
			
			/*
				Inicializa Slide, fazendo as seguintes alterações no HTML, caso parametro seja true
				- Exibe elementos que devem estar visíveis incialmente, de acordo com valor passado por parâmetro
				- Valida exibição de botão próximo
				- Monta paginação
				@param boolean, boolean
				@return undefined
				@author Evandro L. Gonçalves
			*/
			begin: function(ajax, load){
				if((!ajax) || (ajax && load)){
					var 
						htmlPagination,
						htmlElemSize = this.actual.find(".slide li").size()
						;
					
					if(!options.vertical){
						var sizeSlide = parseInt(this.actual.find(".slide li").width()) * this.actual.find(".slide li").size();
						this.actual.find(".slide ul").css("width", sizeSlide);
					}
					
					// Retira class 'off' do 'botão próximo' caso quantidade de elementos seja maior do que a quantidade visível
					if(htmlElemSize > options.elemByPages){
						this.btnNext.removeClass("off");
					}
					
					// Inicializa botões
					this.btnNext.attr("href", "#2");
					this.btnPrev.attr("href", "#1");
	
					// Cria paginação caso 'pagination' seja 'true'
					if(options.pagination){
						htmlPagination = "<ul class=\"pagination\">";
						htmlPagination += "<li><a class=\"atv\" href=\"#1\">1</a></li>";
						
						if(htmlElemSize > options.elemByPages){
							for(var i=2; i<=this.countElem; i++){
								htmlPagination += "<li><a href=\"#" + i + "\">" + i + "</a></li>";
							}
						}
	
						htmlPagination += "</ul>";
	
						this.actual.append(htmlPagination);
					}
					
					// Chama métodos de 'paginação' e 'auto-scroll'
					this.pagination();
					this.autoScroll();
				}
			},
			
			/*
				Faz paginação nos elementos de botões e links para as páginas
				@return undefined
				@author Evandro L. Gonçalves
			*/
			pagination: function(){
				var 
					actual = this.actual,
					elemPagination = actual.find(".pagination a"),
					elemPagAtv = actual.find(".pagination a.atv"),
					elemWeight = options.vertical ? actual.find(".slide li").height() : actual.find(".slide li").width(),
					maxPage = this.countElem,
					elemPosition = 0,
					btnNext = this.btnNext,
					btnPrev = this.btnPrev,
					buttons = options.pagination ? actual.find(".btnPrev, .btnNext, .pagination a") : actual.find(".btnPrev, .btnNext");
					
				// seta comportamento para os botões próximo e anterior
				buttons.click(function(e){				   
					var btnClass = $(this).attr("class") === "" || $(this).attr("class") === "atv" ? null : $(this).attr("class");
					
					actual.find(".pagination a.atv").removeClass("atv");
					Methods.page = parseInt($(this).attr("href").replace("#", ""));
					elemPagAtv = actual.find(".pagination a:eq(" + (Methods.page - 1) + ")");
					elemPagAtv.addClass("atv");
					btnNext.attr("href", "#"+ (Methods.page + 1));
					btnPrev.attr("href", "#"+ (Methods.page - 1));
					
					if(Methods.page === maxPage){
						btnNext.addClass("off");
					}else if(Methods.page === 1){
						btnPrev.addClass("off");
					}
					
					if(Methods.page > 1 && btnPrev.hasClass("off")){
						btnPrev.removeClass("off");
					}else if(Methods.page < maxPage && btnNext.hasClass("off")){
						btnNext.removeClass("off");
					}
					
					// Caso haja clique, autoScroll é cancelado
					if(options.autoScroll){
						clearInterval(Methods.fncAutoScroll);
					}
					
					// Faz calculo da mudança de posição
					elemPosition = (((Methods.page-1)*options.elemByPages)*elemWeight)*-1;
					// Chama método responsável por fazer o movimento de 'slide'
					Methods.slide(actual, elemPosition);

					e.preventDefault();
				});
			},
			
			/*
				Método que faz efeito de transação, conforme a opção 'effect'
				@param Object, int
				@return undefined
				@author Evandro L. Gonçalves
			*/
			slide: function(actual, position){
				var containerSlide = actual.find(".slide ul");
					
				if(options.effect){
					options.vertical ? containerSlide.animate({marginTop:position}) : containerSlide.animate({marginLeft:position});
				}else{
					options.vertical ? containerSlide.css("margin-top", position) : containerSlide.css("margin-left", position);
				}
			},
			
			/*
				Responsável por executar 'auto-scroll'
				@return undefined
				@author Evandro L. Gonçalves
			*/
			autoScroll: function(){
				if(!isNaN(options.autoScroll) && options.autoScroll > 0){
					var 
						actual = this.actual,
						btnNext = this.btnNext,
						btnPrev = this.btnPrev,
						countElem = this.countElem,
						elemWeight = this.elemWeight;
						elemPosition = null;
						
					options.autoScroll = options.autoScroll * 1000;
						
					this.fncAutoScroll = setInterval(
						function(){
							Methods.page < (countElem) ? ++Methods.page : Methods.page = 1;
							elemPosition = (((Methods.page-1)*options.elemByPages)*elemWeight)*-1;
							
							btnNext.attr("href", "#" + (Methods.page + 1));
							btnPrev.attr("href", "#" + (Methods.page - 1));
							
							if(options.pagination){
								actual.find(".pagination a.atv").removeClass("atv");
								actual.find(".pagination a:eq(" + (Methods.page - 1) + ")").addClass("atv");
							}
							
							if(Methods.page === 1){
								btnPrev.addClass("off");
							}else if(btnPrev.hasClass("off")){
								btnPrev.removeClass("off");
							}
							
							if(Methods.page === countElem){
								btnNext.addClass("off");
							}else if(btnNext.hasClass("off")){
								btnNext.removeClass("off");
							}
							
							Methods.slide(actual, elemPosition);
						}, 
						options.autoScroll
					);
				}
			},
			
			/*
				Monta HTML a partir da leitura de um arquivo externo (momentâneamente, apenas 'JSON'), lido de forma assincrona
				@return undefined
				@author Evandro L. Gonçalves
			*/
			ajax: function(){				
				if(options.ajax !== null){
					if((options.ajax.indexOf(".js") !== -1 || options.ajax.indexOf(".json") !== -1)){
						$.getJSON(options.ajax, function(data){
							var 
								i, 
								elemSize = data.elements.length,
								htmlSlide = "<ul>",
								htmlSlideElem = "<li>{elem}</li>";
							
							// Monta HTML do 'slide' de acordo com o conteúdo do arquivo 							
							for(i=0; i<elemSize; i++){
								htmlSlide += htmlSlideElem.replace("{elem}", "<img src=\""+data.elements[i].image+"\" alt=\"\" />")	
							}
							
							htmlSlide += "</ul>";
							Methods.actual.find(".slide").html(htmlSlide);
							
							// Faz atualização da contagem de elementos e do width/height da lista
							Methods.countElem = Math.ceil(Methods.actual.find(".slide li").size() / options.elemByPages);
							Methods.elemWeight = options.vertical ? Methods.actual.find(".slide li").height() : Methods.actual.find(".slide li").width();
							
							// Chama método para inicialização do 'slide'
							Methods.begin(true, true);
						});
					}
				}
			}
		}
		
		// Para cada chamada do plugn, invoca o método 'init'
		return this.each(function(){
			Methods.init($(this));
		});		
	}
})(jQuery);