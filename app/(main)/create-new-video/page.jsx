"use client"
import React, { useState } from 'react'
import Topic from './_components/Topic'
import VideoStyle from './_components/VideoStyle';
import Voice from './_components/Voice';
import Captions from './_components/Captions';
import { Button } from '@/components/ui/button';
import { Loader2Icon, WandSparkles } from 'lucide-react';
import Preview from './_components/Preview';
import axios from 'axios';
import { useMutation, useConvex } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { useAuthContext } from '@/app/provider';
import Link from 'next/link';

function CreateNewVideo() {

  const [formData , setFormData] = useState();  
  const [loading, setLoading] = useState(false);
  const [videoId, setVideoId] = useState(null);
  const [videoStatus, setVideoStatus] = useState(null); // 'pending' | 'completed'
  
  const CreateInitialVideoRecord = useMutation(api.videoData.CreateVideoData);
  const { user } = useAuthContext();
  const convex = useConvex();

  const onHandleInputChange = (fieldName, fieldValue) => {
    setFormData(prev => ({
      ...prev,
      [fieldName]: fieldValue
    }))
  }

  const GenerateVideo = async () => {
    if (user?.credits <= 0) {
      toast('Please add more credits!');
      return;
    }

    if (!formData?.topic || !formData?.script || !formData?.videoStyle || !formData?.caption || !formData?.voice) {
      console.log("ERROR", "Enter All Fields");
      return;
    }

    setLoading(true);

    // 1. Save initial record to DB
    const resp = await CreateInitialVideoRecord({
      title: formData.title,
      topic: formData.topic,
      script: formData.script,
      videoStyle: formData.videoStyle,
      caption: formData.caption,
      voice: formData.voice,
      uid: user?._id,
      createdBy: user?.email,
      credits: user?.credits
    });

    console.log("Video record ID:", resp);
    setVideoId(resp);
    setVideoStatus('pending');

    // 2. Start polling
    pollVideoStatus(resp);

    // 3. Trigger backend generation
    await axios.post('/api/generate-video-data', {
      ...formData,
      recordId: resp
    });
  }

  const pollVideoStatus = (id) => {
    const intervalId = setInterval(async () => {
      const result = await convex.query(api.videoData.GetVideoById, {
        videoId: id
      });

      if (result?.status === 'completed') {
        clearInterval(intervalId);
        setVideoStatus('completed');
        setLoading(false);
      } else {
        console.log('Still pending...');
      }
    }, 5000);
  }

  return (
    <div>
      <h2 className='text-3xl'>Create New Video</h2>

      <div className='grid grid-cols-1 md:grid-cols-3 mt-8 gap-7'>
        <div className='col-span-2 p-7 border rounded-xl h-[72vh] overflow-auto'>

          {/* topic and script */}
          <Topic onHandleInputChange={onHandleInputChange} />
          {/* video Image Style */}
          <VideoStyle onHandleInputChange={onHandleInputChange} />
          {/* voice */}
          <Voice onHandleInputChange={onHandleInputChange} />
          {/* captions */}
          <Captions onHandleInputChange={onHandleInputChange} />

          <Button className="w-full mt-5"
            disabled={loading || videoStatus === 'pending'}
            onClick={GenerateVideo}
          >
            {loading ? <Loader2Icon className='animate-spin' /> : <WandSparkles />}Generate Video
          </Button>

          {/* Video status messages */}
          {videoStatus === 'pending' && (
            <p className="text-yellow-600 mt-4 text-center">⏳ Your video is being generated...</p>
          )}

          {videoStatus === 'completed' && videoId && (
            <Link href={`/play-video/${videoId}`}>
              <Button className="w-full mt-4" variant="outline">
                🎉 View Your Video
              </Button>
            </Link>
          )}
        </div>

        <div>
          <Preview formData={formData} />
        </div>
      </div>
    </div>
  )
}

export default CreateNewVideo;
