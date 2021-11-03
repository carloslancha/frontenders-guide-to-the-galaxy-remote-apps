import React, {useEffect, useCallback, useRef, useState} from 'react';
import ReactDOM from 'react-dom';
import CanvasDraw from "react-canvas-draw";
import {ClayCheckbox} from '@clayui/form';
import ClayColorPicker from '@clayui/color-picker';
import ClayButton from "@clayui/button";
import ClayIcon from '@clayui/icon';
import {ClayInput, ClaySelect} from '@clayui/form';
import ClayLayout from "@clayui/layout";
import ClayList from '@clayui/list';

const {Liferay, themeDisplay} = window;
const spritemap = `${themeDisplay.getPathThemeImages()}/lexicon/icons.svg`;

function App() {
	const canvasDrawRef = useRef();
	const canvasResultRef = useRef();

	const [brushColor, setBrushColor] = useState('#000000');
	const [documents, setDocuments] = useState();
	const [hideGrid, setHideGrid] = useState(true);
	const [name, setName] = useState('');
	const [selectedDocument, setSelectedDocument] = useState();
	const [siteGroupId, setSiteGroupId] = useState();

	const getDocuments = useCallback(() => {
		Liferay.Util.fetch(
			`/o/headless-delivery/v1.0/sites/${siteGroupId}/documents`)
		.then((response) => response.json())
		.then(({items}) => setDocuments(items));
	}, [siteGroupId]);

	const getSiteGroupId = () => {
		setSiteGroupId(themeDisplay.getSiteGroupId());
	};

	const handleSave = () => {
		if (!name || name === '') {
			alert('You must specify a name for the document');
			return false;
		}

		const drawingCanvas = canvasDrawRef.current.canvas.drawing;
		const bgCanvas = canvasDrawRef.current.canvas.grid;

		const newCanvas = canvasResultRef.current;

		newCanvas.setAttribute('width', drawingCanvas.getAttribute('width'));
		newCanvas.setAttribute('height', drawingCanvas.getAttribute('height'));

		const ctx = newCanvas.getContext('2d');

		ctx.drawImage(bgCanvas, 0, 0);
		ctx.drawImage(drawingCanvas, 0, 0);

		newCanvas.toBlob((blob) => {
			// Create a file with the blob
			const file  = new File(
				[blob],
				`${name}.png`,
				{
					type: `image/png`
				}
			);

			const formData = new FormData();
			formData.append('file', file);

			Liferay.Util.fetch(
				`/o/headless-delivery/v1.0/sites/${siteGroupId}/documents`, {
					headers: {
						'Accept': 'application/json'
					},
					method: 'POST',
					body: formData,
				}
			)
			.then((response) => response.json())
			.then((data) => {
				if (data.status === 'CONFLICT') {
					Liferay.Util.openToast({
						message: data.title,
						type: 'danger',
					});
				} else {
					Liferay.Util.openToast({
						message: 'Hurrah! Your image was uploaded',
						type: 'success',
					});
				}
			})
			.catch((error) => {
				console.log(error);
				Liferay.Util.openToast({
					message: 'An error occured uploading your document',
					type: 'danger',
				});
			});
		});
	};

	const handleSelectImage = (event) => {
		const value = event.currentTarget.value;

		if (value === 'choose') {
			return;
		}

		const document = documents.find(
			(document => document.id.toString() === value));

		Liferay.Util.fetch(document.contentUrl)
		.then((response) => response.blob())
		.then((blob) => {
			const url = URL.createObjectURL(blob);

			setSelectedDocument({
				...document,
				blobURL: url
			});
		});
	};

	useEffect(() => {
		getSiteGroupId();
	}, []);

	useEffect(() => {
		if (siteGroupId) {
			getDocuments();
		}
	}, [getDocuments, siteGroupId])

	useEffect(() => {
		if (selectedDocument) {
			setName(`${selectedDocument.title}-rev`);
		}
	}, [selectedDocument]);

	return (
		<ClayLayout.ContainerFluid view>
			<ClayLayout.Row>
				<ClayLayout.Col size={3} >
					<ClayList>
						<ClayList.Item flex>
							<ClayList.ItemField	className="ml-1">
								<label htmlFor="drawingSelectImage">Select image</label>

								<ClaySelect
									id="drawingSelectImage"
									onChange={handleSelectImage}
								>
									<ClaySelect.Option
										key="choose"
										value="choose"
										label="Choose an image"
									/>

									{documents && documents.map((document) => (
										<ClaySelect.Option
											key={document.id}
											value={document.id}
											label={document.title}
										/>
									))}
								</ClaySelect>
							</ClayList.ItemField>
						</ClayList.Item>

						<ClayList.Item flex>
							<ClayList.ItemField	className="ml-1">
								<label htmlFor="drawingName">Name</label>

								<ClayInput
									id="drawingName"
									onChange={(event) => {
										setName(event.currentTarget.value);
									}}
									type="text"
									value={name}
								/>
							</ClayList.ItemField>
						</ClayList.Item>

						<ClayList.Item flex>
							<ClayList.ItemField	className="ml-1">
								<ClayColorPicker
									onValueChange={(value) => {
										setBrushColor(`#${value}`);
									}}
									showHex={false}
									title="Brush Color"
									value={brushColor}
								/>
							</ClayList.ItemField>
						</ClayList.Item>

						<ClayList.Item flex>
							<ClayList.ItemField	className="ml-1">
								<ClayCheckbox
									checked={hideGrid}
									label="Hide Grid"
									onChange={() => setHideGrid(hideGrid => !hideGrid)}
								/>
							</ClayList.ItemField>
						</ClayList.Item>

						<ClayList.Item flex>
							<ClayList.ItemField>
								<ClayButton
									displayType="secondary"
									onClick={() => {
										canvasDrawRef.current.undo();
									}}
								>
									<span className="inline-item inline-item-before">
										<ClayIcon
											spritemap={spritemap}
											symbol="undo"
										/>
									</span>

									Undo
								</ClayButton>
							</ClayList.ItemField>
						</ClayList.Item>
					</ClayList>

					<ClayButton
						className="mr-2"
						displayType="primary"
						onClick={() => canvasDrawRef.current.clear()}
					>
						Clear
					</ClayButton>

					<ClayButton
						className="ml-2"
						displayType="primary"
						onClick={handleSave}
					>
						Save
					</ClayButton>
				</ClayLayout.Col>

				<ClayLayout.Col size={9}>
					<CanvasDraw
						brushRadius={2}
						brushColor={brushColor}
						canvasWidth="100%"
						hideGrid={hideGrid}
						imgSrc={selectedDocument ? selectedDocument.blobURL : ''}
						key={selectedDocument ? selectedDocument.title : hideGrid}
						lazyRadius={0}
						ref={canvasDrawRef}
					/>

					<canvas
						ref={canvasResultRef}
						style={{
							display: 'none'
						}}
					/>
				</ClayLayout.Col>
			</ClayLayout.Row>
		</ClayLayout.ContainerFluid>
	);
}
class GalaxyPaint extends HTMLElement {
	connectedCallback() {
		this.innerHTML = '<div id="galaxyContainer"></div>';

    ReactDOM.render(
			<App />,
			document.querySelector('#galaxyContainer')
		);
	}
}

if (customElements.get('galaxy-paint')) {
	console.log(
		'Skipping registration for <galaxy-paint> (already registered)'
	);
} else {
	customElements.define('galaxy-paint', GalaxyPaint);
}

export default App;
