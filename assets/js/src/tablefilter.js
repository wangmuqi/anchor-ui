/**
 * tablefilter
 */

const TableFilter = (($) => {

  /**
   * Constants
   */

  const NAME = 'tablefilter'
  const VERSION = '1.0.0-beta'
  const DATA_KEY = 'anchor.tablefilter'
  const EVENT_KEY = `.${DATA_KEY}`
  const DATA_API_KEY = '.data-api'
  const JQUERY_NO_CONFLICT = $.fn[NAME]

  const Default = {}

  const Event = {
    LOAD_DATA_API: `load${EVENT_KEY}${DATA_API_KEY}`,
    CLICK_DATA_API: `click${EVENT_KEY}${DATA_API_KEY}`,
    SEARCH_DATA_API: `search${EVENT_KEY}`
  }

  const Selector = {
    DATA_TABLEFILTER: '[data-toggle="tablefilter"]',
    DATA_FIELDS: '[data-for="fields"]',
    DATA_SUB_FIELDS: '[data-sub-field]',
    TABLEFILTER_WRAPPER: '.tablefilter-wrapper',
    TABLEFILTER_BODY: '.tablefilter-body',
    TABLEFILTER_BLOCK: '.tablefilter-block',
    TABLEFILTER_BLOCK_TITLE: '.tablefilter-block-title',
    TABLEFILTER_ROWS: '.tablefilter-rows',
    TABLEFILTER_ROW: '.tablefilter-row',
    SELECT_FIELD: '.select-field',
    SELECT_OPERATOR: '.select-operator',
    INPUT_VALUE: '.input-value',
    TABLEFILTER_BOTTOM: '.tablefilter-bottom',
    SHOW_TABLEFILTER: '.show-tablefilter'
  }

  const FieldData = [
    {
      fieldType: 'string',
      operators: [
        'STARTSWITH', 'ENDSWITH', 'LIKE', 'NOTLIKE',
        'EQUALS', 'NOT_EQUALS', 'ISEMPTY', 'ISNOTEMPTY',
        'IN', 'NOT_IN', 'EMPTYSTRING',
        'LT_AND_EQUALS', 'GT_AND_EQUALS', 'BETWEEN',
        'SAMEAS', 'NSAMEAS'
      ],
      formType: 'text'
    },
    {
      fieldType: 'reference',
      operators: [
        'EQUALS', 'NOT_EQUALS', 'ISEMPTY', 'ISNOTEMPTY',
        'STARTSWITH', 'ENDSWITH', 'LIKE', 'NOTLIKE',
        'SAMEAS', 'NSAMEAS', 'EMPTYSTRING'
      ],
      formType: 'reference'
    },
    {
      fieldType: 'choice',
      operators: [
        'EQUALS', 'NOT_EQUALS', 'IN', 'NOT_IN',
        'LIKE', 'NOTLIKE', 'STARTSWITH', 'ENDSWITH',
        'SAMEAS', 'NSAMEAS'
      ],
      formType: 'select'
    },
    {
      fieldType: 'date-time',
      operators: [
        'EQUALS', 'NOT_EQUALS', 'LT', 'LT_AND_EQUALS',
        'GT', 'GT_AND_EQUALS', 'BETWEEN',
        'ISEMPTY', 'ISNOTEMPTY', 'SAMEAS', 'NSAMEAS'
      ],
      formType: 'dateTime'
    },
    {
      fieldType: 'numeric',
      operators: [
        'EQUALS', 'NOT_EQUALS', 'ISEMPTY', 'ISNOTEMPTY',
        'LT', 'GT', 'LT_AND_EQUALS', 'GT_AND_EQUALS',
        'BETWEEN', 'SAMEAS', 'NSAMEAS',
        'GT_FIELD', 'LT_FIELD', 'GT_OR_EQUALS_FIELD', 'LT_OR_EQUALS_FIELD'
      ],
      formType: 'number'
    },
    {
      fieldType: 'boolean',
      operators: [
        'EQUALS', 'NOT_EQUALS', 'ISEMPTY', 'ISNOTEMPTY',
        'SAMEAS', 'NSAMEAS'
      ],
      formType: 'bool'
    }
  ]

  const OperatorData = [
    {text: '等于 =', operator: 'EQUALS'},
    {text: '不等于 !=', operator: 'NOT_EQUALS'},
    {text: '小于等于 <=', operator: 'LT_AND_EQUALS'},
    {text: '大于等于 >=', operator: 'GT_AND_EQUALS'},
    {text: '小于 <', operator: 'LT'},
    {text: '大于 >', operator: 'GT'},
    {text: '以 X 字符开始', operator: 'STARTSWITH'},
    {text: '以 X 字符结束', operator: 'ENDSWITH'},
    {text: '含有', operator: 'LIKE'},
    {text: '不含有', operator: 'NOTLIKE'},
    {text: '为 NULL', operator: 'ISEMPTY'},
    {text: '非 NULL', operator: 'ISNOTEMPTY'},
    {text: '在数组中', operator: 'IN'},
    {text: '不在数组中', operator: 'NOT_IN'},
    {text: '空字符串', operator: 'EMPTYSTRING'},
    {text: '在 X 与 Y 之间', operator: 'BETWEEN'},
    {text: '与 X 字段相同', operator: 'SAMEAS'},
    {text: '与 X 字段不相同', operator: 'NSAMEAS'},
    {text: '大于 X 字段', operator: 'GT_FIELD'},
    {text: '小于 X 字段', operator: 'LT_FIELD'},
    {text: '大于等于 X 字段', operator: 'GT_OR_EQUALS_FIELD'},
    {text: '小于等于 X 字段', operator: 'LT_OR_EQUALS_FIELD'}
  ]

  const Template = (id, options = {}) => {
    let templates = {
      BODY: `
        <div class="${TableFilter._getClassName(Selector.TABLEFILTER_BODY)}"></div>
      `,
      BOTTOM: `
        <div class="${TableFilter._getClassName(Selector.TABLEFILTER_BOTTOM)}">
          <button type="button" class="btn btn-primary-base-border" data-action="and">AND</button><!--
          --><button type="button" class="btn btn-primary-base-border" data-action="or">OR</button><!--
          --><button type="button" class="btn btn-primary-base-border" data-action="search">
            <span class="glyphicon glyphicon-search"></span>
            搜索
          </button>
        </div>
      `,
      BLOCK: `
        <div class="${TableFilter._getClassName(Selector.TABLEFILTER_BLOCK)}">
          <div class="${TableFilter._getClassName(Selector.TABLEFILTER_BLOCK_TITLE)}"></div>
          <div class="${TableFilter._getClassName(Selector.TABLEFILTER_ROWS)}"></div>
        </div>
      `,
      ROW: `
        <div class="${TableFilter._getClassName(Selector.TABLEFILTER_ROW)} ${options.type}-row"></div>
      `,
      SECTION_FIELD: `
        <span class="tablefilter-row-section field-section">
          <select class="${TableFilter._getClassName(Selector.SELECT_FIELD)} selectpicker" title="请选择字段">${options.options}</select>
        </span>
      `,
      SECTION_OPERATOR: `
        <span class="tablefilter-row-section operator-section">
          <select class="${TableFilter._getClassName(Selector.SELECT_OPERATOR)} selectpicker" title="关系" disabled></select>
        </span>
      `,
      SECTION_VALUE: `
        <span class="tablefilter-row-section value-section">
          <input class="${TableFilter._getClassName(Selector.INPUT_VALUE)} form-control" placeholder="值" disabled/>
        </span>
      `,
      SECTION_BUTTON: `
        <span class="tablefilter-row-section btn-section">
          ${
            options.type === 'and' ?
            `
              <button type="button" class="btn btn-default hide" data-action="and">and</button>
              <button type="button" class="btn btn-default hide" data-action="or">or</button>
            ` : ``
          }
          <button type="button" class="btn btn-default" data-action="delete">×</button>
        </span>
      `
    }
    return templates[id]
  }

  /**
   * Class Definition
   */

  class TableFilter {
    constructor (root, config) {
      this._config = this._getConfig(config)
      this.$root = $(root)
      this.$body = null
      this.$bottom = null
      this.options = {
        fields: null,
        sub: {}
      }
      this.url = {}

      this.init()
    }

    // getters

    static get VERSION () {
      return VERSION
    }

    static get Default () {
      return Default
    }

    // public

    init () {
      this.$root.addClass(`${TableFilter._getClassName(Selector.TABLEFILTER_WRAPPER)} form-inline`)
      this.$root
        .append(Template('BODY'))
        .append(Template('BOTTOM'))

      this.$body = this.$root.find(Selector.TABLEFILTER_BODY)
      this.$bottom = this.$root.find(Selector.TABLEFILTER_BOTTOM)

      this.getFieldsOptions()
      this.getSubFieldsOptions()
      this.getUrl()
      this.addBlock()
    }

    getFieldsOptions () {
      let $options = this.$root.find(Selector.DATA_FIELDS).children()

      this.options.fields = this._getHtml($options)
    }

    getSubFieldsOptions () {
      this.$root.find(Selector.DATA_SUB_FIELDS).each((i, el) => {
        let field = $(el).data('sub-field')
        let $options = $(el).children()

        this.options.sub[field] = this._getHtml($options)
      })
    }

    getUrl () {
      this.$root.find(Selector.DATA_FIELDS).children().each((i, el) => {
        let key = $(el).attr('value')
        let url = $(el).data('url')

        if (url) this.url[key] = url
      })
    }

    addBlock () {
      let block = Template('BLOCK')
      let $block = $(block)

      this.$body.append($block)
      this.addRow({
        blockIndex: this._getCurrentBlocksNum() - 1
      })
    }

    deleteBlock (index) {
      let $block = this.$body.find(Selector.TABLEFILTER_BLOCK).eq(index)

      $block.remove()
    }

    addRow (options = {}) {
      options = {
        blockIndex: 0,
        rowIndex: -1,
        type: 'and',
        ...options
      }

      let $block = this.$body.find(Selector.TABLEFILTER_BLOCK).eq(options.blockIndex)
      let row = Template('ROW', {
        type: options.type
      })
      let $row = $(row)
      let section = {
        field: Template('SECTION_FIELD', {
          options: this.options.fields
        }),
        operator: Template('SECTION_OPERATOR'),
        value: Template('SECTION_VALUE'),
        btn: Template('SECTION_BUTTON', {
          type: options.type
        })
      }

      switch (options.type) {
        case 'and':
          section.type = ''
          break

        case 'or':
          section.type = '<span class="row-type">or</span>'
          break
      }

      $row
        .data('condition', options.type)
        .append(section.type)
        .append(section.field)
        .append(section.operator)
        .append(section.value)
        .append(section.btn)

      let $btns = $row.find('.btn-section .btn')

      $btns.on('click', (event) => {
        let action = $(event.target).data('action')
        let $block = $(event.target).closest(Selector.TABLEFILTER_BLOCK)
        let $row = $(event.target).closest(Selector.TABLEFILTER_ROW)
        let blockIndex = $block.index()
        let rowIndex = $row.index()

        switch (action) {
          case 'and':
            this.addRow({blockIndex})
            break

          case 'or':
            let nextOrRowsNum = $row.nextUntil('.and-row').length
            let orRowIndex = rowIndex + 1 + nextOrRowsNum

            this.addRow({
              blockIndex,
              rowIndex: orRowIndex,
              type: 'or'
            })
            break

          case 'delete':
            this.deleteRow({blockIndex, rowIndex})
            break
        }
      })

      $row.find(`select${Selector.SELECT_FIELD}`).on('changed.bs.select', (event) => {
        let fieldType = $(event.target).find('option:selected').data('field')
        let operators = FieldData.find((item) => item.fieldType === fieldType).operators
        let $selectOperator = $row.find(`select${Selector.SELECT_OPERATOR}`)

        $selectOperator.empty()
        $selectOperator.prop('disabled', false)
        $btns.removeClass('hide')

        {
          let i = 0

          operators.forEach((operator) => {
            let data = OperatorData.find((opt) => opt.operator === operator)
            let option = `<option value="${data.operator}">${data.text}</option>`
            let $option = $(option)
            if (!i) $option.attr('selected', 'selected')

            $selectOperator.append($option)

            i ++
          })
        }

        $row.find(`select${Selector.SELECT_OPERATOR}`).trigger('changed.bs.select')
        this._refreshFormEl()
      })

      $row.find(`select${Selector.SELECT_OPERATOR}`).on('changed.bs.select', (event) => {
        let operator = $(event.target).selectpicker('val')
        let fieldType = $row.find(`select${Selector.SELECT_FIELD} option:selected`).data('field')
        let formType = FieldData.find((item) => item.fieldType === fieldType).formType
        let subField = $row.find(`select${Selector.SELECT_FIELD} option:selected`).attr('value')

        this.renderValueSection({$row, operator, formType, subField})
        this._refreshFormEl()
      })

      if (options.rowIndex === -1) $block.find(Selector.TABLEFILTER_ROWS).append($row)
      else {
        let $el = $block.find(Selector.TABLEFILTER_ROW).eq(options.rowIndex)
        if ($el.length) $el.before($row)
        else $block.find(Selector.TABLEFILTER_ROWS).append($row)
      }

      this._adjustLayout()
      this._refreshFormEl()
    }

    deleteRow (options = {}) {
      if ([options.blockIndex, options.rowIndex].includes(undefined)) return

      let $block = this.$body.find(Selector.TABLEFILTER_BLOCK).eq(options.blockIndex)
      let $row = $block.find(Selector.TABLEFILTER_ROW).eq(options.rowIndex)

      $row.remove()
      this._adjustLayout()
    }

    renderValueSection (options = {}) {
      let {$row, operator, formType, subField} = options
      let group = {
        zeroInput: [
          'ISEMPTY', 'ISNOTEMPTY', 'EMPTYSTRING'
        ],
        oneInput: [
          'EQUALS', 'NOT_EQUALS', 'LT_AND_EQUALS', 'GT_AND_EQUALS',
          'LT', 'GT'
        ],
        twoInput: [
          'BETWEEN'
        ],
        textInput: [
          'STARTSWITH', 'ENDSWITH', 'LIKE', 'NOTLIKE'
        ],
        multipleInput: [
          'IN', 'NOT_IN'
        ],
        selectField: [
          'SAMEAS', 'NSAMEAS', 'GT_FIELD', 'LT_FIELD',
          'GT_OR_EQUALS_FIELD', 'LT_OR_EQUALS_FIELD'
        ],
      }
      let formElMap = {
        text: `<input class="form-control"/>`,
        number: `<input class="form-control" type="number"/>`,
        select: `<select class="selectpicker"></select>`,
        multipleSelect: `<select class="selectpicker" multiple title="请选择"></select>`,
        dateTime: `<input class="form-control datetimepicker"/>`,
        tagsInput: `<input class="form-control tagsinput"/>`,
        bool: `
          <select class="selectpicker">
            <option value="true">true</option>
            <option value="false">false</option>
          </select>
        `,
        reference: `
          <div class="input-group">
            <input class="form-control reference-input" readonly/>
            <a class="input-group-addon reference-input-addon" href="">
              <span class="glyphicon glyphicon-search"></span>
            </a>
          </div>
        `
      }
      let formEl = formElMap[formType]
      let $section = $row.find('.value-section')
      let renderType

      Object.keys(group).forEach((type) => {
        if (group[type].includes(operator)) renderType = type
      })

      let renderInfo = `${formType}-${renderType}`
      let prevRenderInfo = $row.data('render-info')

      if (renderInfo === prevRenderInfo) return
      if (
        ['text-oneInput', 'text-textInput'].includes(renderInfo) &&
        ['text-oneInput', 'text-textInput'].includes(prevRenderInfo)
      ) return

      $row.data('render-info', renderInfo)
      $section.empty()

      let content = formEl
      let callback = `callback_${Math.random().toString(36).substr(2)}`

      switch (formType) {
        case 'select':
          content = this._getHtml($(content).append(this.options.sub[subField]))
          break
      }

      switch (renderType) {
        case 'zeroInput':
          content = null
          break

        case 'twoInput':
          content = new Array(2).fill(content).join(' 与 ')
          break

        case 'textInput':
          content = formElMap.text
          break

        case 'multipleInput':
          if (formType === 'text') content = formElMap.tagsInput
          else if (formType === 'select') content = this._getHtml($(formElMap.multipleSelect).html(content))
          break

        case 'selectField':
          content = this._getHtml($(formElMap.select).append(this.options.fields))
          break
      }

      $section.append(content)

      switch (formType) {
        case 'reference':
          window[callback] = (val, name) => {
            $row.find('.reference-input').val(name).data('value', val)
          }

          $section.find('.reference-input-addon').on('click', (event) => {
            event.preventDefault()

            let url = `${this.url[subField]}${this.url[subField].includes('?') ? '&' : '?'}callback=${callback}`
            window.open(url, null, 'width=1024,height=500')
          })

          break
      }
    }

    actionBtnClick (element) {
      let $btn = $(element).closest('.btn')
      let action = $btn.data('action')

      switch (action) {
        case 'and':
          this.addRow()
          break

        case 'or':
          this.addBlock()
          break

        case 'search':
          this.search()
          break
      }
    }

    toggle () {
      this.$root.toggleClass(TableFilter._getClassName(Selector.SHOW_TABLEFILTER))
    }

    search () {
      let conditionOperatorMap = {
        and: '^',
        or: '^OR',
        AND: '',
        OR: '^NQ'
      }
      let query = ''

      this.$body.find(Selector.TABLEFILTER_BLOCK).each((blockIndex, block) => {
        $(block).find(Selector.TABLEFILTER_ROW).each((rowIndex, row) => {
          let condition = rowIndex ? $(row).data('condition') : $(block).data('condition')
          let field = $(row).find(Selector.SELECT_FIELD).selectpicker('val')
          let operator = $(row).find(Selector.SELECT_OPERATOR).selectpicker('val')
          let $valueSection = $(row).find('.value-section')
          let vals = []

          if (field) {
            $valueSection.find('input, select').each((i, el) => {
              let tag = $(el).prop('tagName').toLowerCase()
              let val

              switch (tag) {
                case 'input':
                  val = $(el).data('value') !== undefined ? $(el).data('value') : $(el).val()
                  break

                case 'select':
                  val = $(el).selectpicker('val')
                  break
              }

              vals.push(encodeURIComponent(val))
            })

            let separator = ''
            if (operator === 'BETWEEN') separator = '@'
            let value = vals.join(separator)

            query += `${conditionOperatorMap[condition]}${encodeURIComponent(field)}${operator}${value}`
          }
        })
      })

      this.$root.trigger(Event.SEARCH_DATA_API, {query})
    }

    // private

    _getConfig (config) {
      config = $.extend({}, Default, config)
      return config
    }

    _getHtml ($el) {
      return $('<div>').append($el.clone()).html()
    }

    _getCurrentBlocksNum () {
      let $blocks = this.$body.find(Selector.TABLEFILTER_BLOCK)
      return $blocks.length
    }

    _getCurrentRowsNum (blockIndex) {
      let $block = this.$body.find(Selector.TABLEFILTER_BLOCK)
      if (blockIndex !== undefined) $block = $block.eq(blockIndex)
      let $rows = $block.find(Selector.TABLEFILTER_ROW)

      return $rows.length
    }

    _adjustLayout () {
      this.$body.find(Selector.TABLEFILTER_BLOCK).each((i, el) => {
        if (!$(el).find(Selector.TABLEFILTER_ROW).length) this.deleteBlock(i)
      })

      let $blocks = this.$body.find(Selector.TABLEFILTER_BLOCK)
      let blocksNum = this._getCurrentBlocksNum()
      let rowsNum = this._getCurrentRowsNum()

      if (blocksNum) {
        $blocks.each((i, el) => {
          let title = i ? 'OR' : ''
          $(el)
            .data('condition', i ? 'OR' : 'AND')
            .find(Selector.TABLEFILTER_BLOCK_TITLE).empty().text(title)
        })

        {
          let title = rowsNum > 1 ? '所有条件必须满足' : ''
          $blocks.eq(0).find(Selector.TABLEFILTER_BLOCK_TITLE).empty().text(title)
        }
      } else {
        this.addBlock()
      }
    }

    _refreshFormEl () {
      this.$body
        .find('.selectpicker').selectpicker('refresh')
        .end().find('.datetimepicker').datetimepicker({
          format: 'YYYY-MM-DD HH:mm:ss',
          locale: 'zh-cn'
        })
        .end().find('.tagsinput').tagsinput()
    }

    // static

    static _getClassName (className) {
      className = className.replace(/\./g, '')
      return className
    }

    static _jQueryInterface (config) {
      let funcResult

      let defaultResult = this.each((i, el) => {
        let data = $(el).data(DATA_KEY)
        let _config = $.extend(
          {},
          TableFilter.Default,
          $(el).data(),
          typeof config === 'object' && config
        )

        if (!data) {
          data = new TableFilter(el, _config)
          $(el).data(DATA_KEY, data)
        }

        if (typeof config === 'string') {
          if (typeof data[config] === 'undefined') {
            throw new Error(`No method named "${config}"`)
          }
          funcResult = data[config]()
        }
      })

      return funcResult === undefined ? defaultResult : funcResult
    }

    static _actionBtnClickHandler (event) {
      let target = $(event.target).closest(Selector.DATA_TABLEFILTER)[0]
      if (!$(target).length) return

      let config = $.extend({}, $(target).data())
      TableFilter._jQueryInterface.call($(target), config)

      $(target).data(DATA_KEY).actionBtnClick(event.target)
    }
  }

  /**
   * Data Api
   */

  $(document).on(Event.CLICK_DATA_API, `${Selector.TABLEFILTER_BOTTOM} [data-action]`, TableFilter._actionBtnClickHandler)

  $(window).on(Event.LOAD_DATA_API, () => {
    $(Selector.DATA_TABLEFILTER).each((i, el) => {
      let $tablefilter = $(el)

      TableFilter._jQueryInterface.call($tablefilter, $tablefilter.data())
    })
  })

  /**
   * jQuery
   */

  $.fn[NAME] = TableFilter._jQueryInterface
  $.fn[NAME].Constructor = TableFilter
  $.fn[NAME].noConflict = () => {
    $.fn[NAME] = JQUERY_NO_CONFLICT
    return TableFilter._jQueryInterface
  }

  return TableFilter

})(jQuery)
