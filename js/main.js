/*
*    main.js
*    6.7 - jQuery UI slider
*/

const MARGIN = { LEFT: 100, RIGHT: 10, TOP: 10, BOTTOM: 100 }
const WIDTH = 800 - MARGIN.LEFT - MARGIN.RIGHT
const HEIGHT = 500 - MARGIN.TOP - MARGIN.BOTTOM

const svg = d3.select("#chart-area").append("svg")
  .attr("width", WIDTH + MARGIN.LEFT + MARGIN.RIGHT)
  .attr("height", HEIGHT + MARGIN.TOP + MARGIN.BOTTOM)

const g = svg.append("g")
  .attr("transform", `translate(${MARGIN.LEFT}, ${MARGIN.TOP})`)

let time = 0
let interval
let formattedData

// Tooltip
const tip = d3.tip()
  .attr('class', 'd3-tip')
	.html(d => {
		let text = `<strong>ID:</strong> <span style='color:red;text-transform:capitalize'>${d.ID}</span><br>`
		text += `<strong>Q1_AI_knowledge:</strong> <span style='color:red;text-transform:capitalize'>${d.Q1_AI_knowledge}</span><br>`
		text += `<strong>Q2_AI_sources:</strong> <span style='color:red;text-transform:capitalize'>${d.Q2_AI_sources}</span><br>`
		text += `<strong>Q2_1_Internet:</strong> <span style='color:red;text-transform:capitalize'>${d.Q2_1_Internet}</span><br>`
		text += `<strong>Q6_Domains:</strong> <span style='color:red;text-transform:capitalize'>${d.Q6_Domains}</span><br>`
		return text
	})
g.call(tip)

// Scales
const x = d3.scaleLinear() //แกนX
	.range([0, WIDTH])
	.domain([1, 100])
const y = d3.scaleLinear()//เเกน Y  
	.range([HEIGHT, 0]) //HEIGHT ความสูงของเเกนY ที่คำนวนจาก margin
	.domain([0, 10])
const area = d3.scaleLinear() //สร้างวงกลม
	.range([25*Math.PI, 2000*Math.PI]) //ขอบเขตวงกลม
	.domain([0, 150000])
const continentColor = d3.scaleOrdinal(d3.schemePastel2)

// Labels
const xLabel = g.append("text") // ข้อความใต้กราฟเเนวเเกนX 
	.attr("y", HEIGHT + 50)
	.attr("x", WIDTH / 2)
	.attr("font-size", "20px")
	.attr("text-anchor", "middle")
	.text("ID")
const yLabel = g.append("text") //ข้อความใต้กราฟแนวแกน Y
	.attr("transform", "rotate(-90)")
	.attr("y", -80)
	.attr("x", -170)
	.attr("font-size", "20px")
	.attr("text-anchor", "middle")
	.text("AI_KNOWLEDGE")

// X Axis
const xAxisCall = d3.axisBottom(x) // ความ ในเเกน X ที่เป็นค่าคร่าวๆ
g.append("g")
	.attr("class", "x axis")
	.attr("transform", `translate(0, ${HEIGHT})`) //ตำเเหน่งเส้นเเกนX
	.call(xAxisCall)

// Y Axis
const yAxisCall = d3.axisLeft(y)
g.append("g")
	.attr("class", "y axis")
	.call(yAxisCall)

const continents = ["Internet", "Internet;Social media", "I don't inform myself about AI"] //ชื่อประเทศ ด้านข้าง

const legend = g.append("g")
	.attr("transform", `translate(${WIDTH - 30}, ${HEIGHT - 360})`) //ตำเเหน่งสีที่บอกประเทศ

continents.forEach((Q2_AI_sources, i) => {
	const legendRow = legend.append("g")
		.attr("transform", `translate(0, ${i * 20})`) //loop componentเพื่อแสดง

	legendRow.append("rect") //รูปสีที่เป็นสีเหลี่ยมข้างชื่อประเทศ
    .attr("width", 10)
    .attr("height", 10)
	.attr("fill", continentColor(Q2_AI_sources))

	legendRow.append("text") //รูปแบบตัวอักษรประเทศ
    .attr("x", -10)
    .attr("y", 10)
    .attr("text-anchor", "end")
    .style("text-transform", "capitalize")
    .text(Q2_AI_sources)
})

d3.json("data/STUDENTAIDATASET.json").then(function(data){
	// clean data
	formattedData = data.map(Q2_AI_sources => {
		return Q2_AI_sources["STUDENTAIDATASET"].filter(Q2_AI_sources => {
			const dataExists = (Q2_AI_sources.ID && Q2_AI_sources.Q1_AI_knowledge)
			return dataExists
		}).map(Q2_AI_sources => {
			Q2_AI_sources.ID = Number(Q2_AI_sources.ID)
			Q2_AI_sources.Q1_AI_knowledge = Number(Q2_AI_sources.Q1_AI_knowledge)
			return Q2_AI_sources
		})
	})

	// first run of the visualization
	update(formattedData[0])
})




$("#continent-select")
	.on("change", () => {
		update(formattedData[time]) //แสดงดาต้า ณตำเเหน่งที่time
})




function update(data) {
	// standard transition time for the visualization
	const t = d3.transition()
		.duration(100)

	const Q2_AI_sources = $("#continent-select").val()
	const filteredData = data.filter(d => {
		if (Q2_AI_sources === "all"){
		 return true
		}
		else 
		{
			return d.Q2_AI_sources == Q2_AI_sources
		}
	})

	// JOIN new data with old elements.
	const circles = g.selectAll("circle")
		.data(filteredData, d => d.Q2_AI_sources)

	// EXIT old elements not present in new data.
	circles.exit().remove()

	// ENTER new elements present in new data.
	circles.enter().append("circle")
		.attr("fill", d => continentColor(d.Q2_AI_sources))
		.on("mouseover", tip.show)
		.on("mouseout", tip.hide)
		.merge(circles)
		.transition(t)

			.attr("opacity", 0.7) 
			.attr("cy", d => y(d.Q1_AI_knowledge))
			.attr("cx", d => x(d.ID))
			.attr("r", d => Math.sqrt(80 / Math.PI))//ขนาดวงกลมจากจำนวนประชากร

	// update the time label
	timeLabel.text(String(time + 1800))

	$("#year")[0].innerHTML = String(time + 1800)
	$("#date-slider").slider("value", Number(time + 1800))
}