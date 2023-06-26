//Get our url
const href = new URL(window.location.href);
//Get id
const endpointId = href.searchParams.get("endpointId");
//Get ws url from navigaro url
const url = "ws://" +href.host;

function addVideoForStream(stream)
{
	//Do not duplicate
	if (document.getElementById(stream.id))
		return;
	
	//Create new video element
	let video = document.createElement(stream.getVideoTracks().length ? "video" : "audio");
	//Set same id
	video.id = stream.id;
	//Set src stream
	video.srcObject = stream;
	//Set other properties
	video.autoplay = true;
	video.controls = true;
	video.muted = true;
	video.addEventListener("click", function ()
	{
		video.play();
		return false;
	});
	//Empty container
	container.innerHTML= "";
	//Append it
	container.appendChild(video);

	stream.getTracks()[0].onended = ()=>container.removeChild(video);
}

function connect(url, name) 
{
	let pc;
	const ws = new WebSocket(url);
	const tm = window.tm = new TransactionManager(ws);

	tm.on("cmd", async function (cmd)
	{
		console.log("ts::cmd", cmd);
		//Get cmd data
		const data = cmd.data;

		//Depending on the event kind
		switch (cmd.name)
		{
			//Periodic video layer info
			case "create":
			{	
				//Destroy previous one if any
				pc?.close();
				//Create peer connection 
				pc = window.pc = new RTCPeerConnection();
				pc.ontrack = (event) => {
					console.debug("pc::onAddStream", event);
					//Play it
					addVideoForStream(event.streams[0]);
				};
				//SDP O/A
				await pc.setRemoteDescription({type:"offer", sdp: data.offer});
				await pc.setLocalDescription();
				//Accept command
				cmd.accept({answer: pc.localDescription.sdp});
				break;
			}
			case "destroy":
			{
				//Destroy previous one if any
				pc?.close();
				break;
			}
			default:
			//Not supported
		}
	});

	ws.onopen = async function ()
	{
		console.log("ws:opened");

		//Register endpoint
		const registered = await tm.cmd("register",{
			uuid: endpointId
		});

		document.querySelector(".uri").innerText = "WHIP URL: http://" + href.host + "/whip/endpoints/"+registered.uuid;
	};

	ws.onclose = function ()
	{
		console.log("ws:closed");
		pc?.close();
	}
}

document.addEventListener("DOMContentLoaded", function (event)
{
	connect(url);
});
