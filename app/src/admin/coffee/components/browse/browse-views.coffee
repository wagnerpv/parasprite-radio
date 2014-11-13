@App.module 'Browse', (Browse, App, Backbone, Marionette, $, _) ->

	class Browse.Layout extends Marionette.LayoutView
		el: '#browseLayout'
		template: false

		regions:
			fileList: '#fileList'
			browsePath: '#browsePath'


	class Browse.PathItem extends Marionette.ItemView
		tagName: 'li'
		template: 'browse-path-item'

		events:
			'click div': 'clicked'

		clicked: ->
			@trigger 'click', @model


		modelEvents:
			'change': 'modelChanged'

		initialize: ->
			@modelChanged()

		modelChanged: ->
			if @model.get 'current'
				@$el.addClass 'current'
			else
				@$el.removeClass 'current'
			@render()




	class Browse.Path extends Marionette.CollectionView
		tagName: 'ul'
		template: false
		childView: Browse.PathItem
		className: 'browse-path'


		initialize: (e) ->
			@currentPath = null
			@listenTo @, 'childview:click', (childView, m) =>
				col = @collection
				pos = col.indexOf m
				path = col.pluck('name').slice(0, pos+1).join('/')
				@trigger 'path:change', path, true
				@trigger 'path:navigate', path
				for m, i in @collection.models
					m.set 'current', i == pos
					
				@currentPath = path

		setPath: (path, fromUser, instant) ->
			if @currentPath != path
				parts = path.split '/'
				oldparts = (@currentPath || '').split '/'

				col = @collection

				for name, i in parts
					m = @collection.models[i]
					if !m
						m = new Backbone.Model
							name: name
						@collection.add m, at: i
					else if m.get('name') != name
						m.set 'name', name
				
				for m, i in @collection.models
					m.set 'current', i == parts.length-1

				while @collection.length > parts.length and @collection.length > oldparts.length
					@collection.pop()

			@trigger 'path:change', path, fromUser, instant
			@currentPath = path