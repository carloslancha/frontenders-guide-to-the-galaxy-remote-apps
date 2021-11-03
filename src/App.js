import React, {useRef, useState} from 'react';
import CanvasDraw from "react-canvas-draw";
import {ClayCheckbox} from '@clayui/form';
import ClayColorPicker from '@clayui/color-picker';
import ClayButton from "@clayui/button";
import ClayIcon from '@clayui/icon';
import {ClayInput} from '@clayui/form';
import ClayLayout from "@clayui/layout";
import ClayList from '@clayui/list';

// Imports the @clayui/css package CSS
import "@clayui/css/lib/css/atlas.css";
import spritemap from "@clayui/css/lib/images/icons/icons.svg";

function App() {
	const canvasDrawRef = useRef();

	const [brushColor, setBrushColor] = useState('#000000');
	const [hideGrid, setHideGrid] = useState(true);
	const [name, setName] = useState('');

	const handleSave = () => {
		if (!name || name === '') {
			alert('You must specify a name for the document');
			return false;
		}

		const dataUrl = canvasDrawRef.current.canvas.drawing.toDataURL();
		const link = document.createElement('a');

		link.setAttribute('download', `${name}.png`);
		link.setAttribute('href', dataUrl);
		link.click();
	};

	return (
		<ClayLayout.ContainerFluid view>
			<ClayLayout.Row>
				<ClayLayout.Col size={3} >
					<ClayList>
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
						lazyRadius={0}
						ref={canvasDrawRef}
					/>
				</ClayLayout.Col>
			</ClayLayout.Row>
		</ClayLayout.ContainerFluid>
	);
}

export default App;
