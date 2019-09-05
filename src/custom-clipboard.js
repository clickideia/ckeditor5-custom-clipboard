import Clipboard from '@ckeditor/ckeditor5-clipboard';
import plainTextToHtml from '@ckeditor/ckeditor5-clipboard/src/utils/plaintexttohtml';
import normalizeClipboardHtml from '@ckeditor/ckeditor5-clipboard/src/utils/normalizeclipboarddata';

class CustomClipboard extends Clipboard {
	init() {
		// Executes Clipboard init method
		super.init();

		const editor = this.editor;
		const modelDocument = editor.model.document;
		const view = editor.editing.view;
		const viewDocument = view.document;

		// Remove default document listener to replace it
		this.stopListening( viewDocument, 'clipboardInput' );

		// Pasting and dropping is disabled when editor is read-only.
		// See: https://github.com/ckeditor/ckeditor5-clipboard/issues/26.
		this.listenTo( viewDocument, 'clipboardInput', evt => {
			if ( editor.isReadOnly ) {
				evt.stop();
			}
		}, { priority: 'highest' } );

		// New listener to paste, sanitize clipboard data with methods on options
		this.listenTo( viewDocument, 'clipboardInput', ( evt, data ) => {
			const dataTransfer = data.dataTransfer;
			const options = this.editor.config.get( 'customClipboard.options' ) || {};

			let content = '';
			let htmlData = '';

			if ( dataTransfer.getData( 'text/html' ) ) {
				htmlData = dataTransfer.getData( 'text/html' );
				if ( options.sanitizeHtml ) {
					htmlData = options.sanitizeHtml( htmlData );
				}
				content = normalizeClipboardHtml( htmlData );
			} else if ( dataTransfer.getData( 'text/plain' ) ) {
				htmlData = dataTransfer.getData( 'text/plain' );
				if ( options.sanitizeText ) {
					htmlData = options.sanitizeText( htmlData );
				}
				content = plainTextToHtml( htmlData );
			}

			content = this._htmlDataProcessor.toView( content );

			this.fire( 'inputTransformation', { content, dataTransfer } );

			view.scrollToTheSelection();
		}, { priority: 'low' } );
	}
}

export default CustomClipboard;
