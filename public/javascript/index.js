Ext.setup({
    onReady:function(){
        Ext.regModel('Ports', {
            fields: ['port']
        });
        var portStore = new Ext.data.JsonStore({
            model: 'Ports'
        });
        var myPanel;
        var pinsPanel= new Ext.Panel({
           scroll:'vertical' 
        });
        now.analogRead=function(pin,value){
            //console.log(pin+' '+value);
            if(pinsPanel.items.getAt(pin+12)){
               var currentSlider = pinsPanel.items.getAt(pin+12).items.getAt(3);
               currentSlider.getThumb().dragObj.updateBoundary();
               currentSlider.setValue(value);
               
            }
        };
        now.digitalRead=function(pin,value){
            if(pinsPanel.items.getAt(pin-2)){
               var currentToggle = pinsPanel.items.getAt(pin-2).items.getAt(2);
               currentToggle.setValue(value); 
            }
        };
        var usbPortsPanel = new Ext.Panel({
           floating:true
           ,items: [
               new Ext.List({
                 itemTpl: '{port}'
                ,singleSelect:true
                ,store:portStore
                ,listeners:{
                    selectionchange:{
                        fn:function(selectionModel,records){
                            usbPortsPanel.hide();
                            var port=records[0].data.port;
                            now.getPins(port,function(pins){
                                for(var i = 2,length=pins.length;i<length;i++){
                                    if(pins[i].supportedModes.length > 0){
                                        var items=[
                                           {
                                               xtype:'container'
                                              ,html:pins[i].analogChannel ==127?'Pin '+i:'Analog Pin'+pins[i].analogChannel
                                              ,style:{
                                                  color:'#FFFFFF'
                                              }
                                           }
                                          ,{
                                                xtype:'selectfield'
                                               //,label:'Pin '+i
                                               ,name:'modes'
                                               ,width:200
                                               ,value:pins[i].mode
                                               ,listeners:{
                                                   change:{
                                                       fn:(function(pinNumber){
                                                             return function(select,newValue){
                                                                 now.pinMode(pinNumber,newValue);
                                                                 if(newValue == now.MODES.INPUT || newValue == now.MODES.OUTPUT){
                                                                     select.nextSibling().show();
                                                                     var slider=select.nextSibling().nextSibling();
                                                                     if(slider){
                                                                         slider.hide();
                                                                     }
                                                                 }else if(newValue == now.MODES.PWM || newValue== now.MODES.ANALOG){
                                                                     select.nextSibling().hide();
                                                                     select.nextSibling().nextSibling().show();
                                                                 }
                                                             };
                                                           })(i)
                                                   }
                                               }
                                               ,options:(function(){
                                                 var pinOptions=[];
                                                 Object.keys(now.MODES).forEach(function(mode){
                                                     if(pins[i].supportedModes.indexOf(now.MODES[mode])>-1){
                                                         pinOption={text:mode,value:now.MODES[mode]};
                                                         pinOptions.push(pinOption);
                                                     }
                                                 });
                                                 return pinOptions;
                                               })()
                                           }
                                          ,{
                                                xtype:'togglefield'
                                               ,id:'toggle-'+i
                                               ,hidden: !(pins[i].mode == now.MODES.OUTPUT || pins[i].mode == now.MODES.INPUT)
                                               ,style:{
                                                    'background-color':'transparent'
                                                }
                                               ,listeners:{
                                                   change:{
                                                       fn:(function(index){
                                                           return function(slider,thumb,newValue,oldValue){
                                                             now.digitalWrite(index,newValue);
                                                           };
                                                       })(i)
                                                   }
                                               }
                                        }];
                                        if(pins[i].supportedModes.indexOf(now.MODES.ANALOG) > -1 || pins[i].supportedModes.indexOf(now.MODES.PWM) > -1){
                                            items.push({
                                                xtype:'sliderfield' 
                                               ,id:'slider-'+i
                                               ,hidden: !(pins[i].mode == now.MODES.ANALOG || pins[i].mode == now.MODES.PWM)    
                                               ,width:'700px'    
                                               ,value:pins[i].value
                                               ,minValue:0
                                               ,maxValue:1026
                                               ,animation:false
                                               ,style:{
                                                 'background-color':'transparent'
                                               }
                                               ,listeners:{
                                                   drag:{
                                                       fn:(function(index){
                                                           return function(slider,thumb,newValue,oldValue){
                                                               if(slider.ownerCt.items){
                                                                   if(slider.ownerCt.items.getAt(1).getValue() == now.MODES.PWM){
                                                                     now.analogWrite(index,newValue);
                                                                   }
                                                               }
                                                           };
                                                       })(i)
                                                   }
                                               }
                                            });
                                        }
                                        var pinToolbar=new Ext.Toolbar({
                                           height:75
                                          ,width:'100%'
                                          ,items:items
                                        });
                                    }
                                    pinsPanel.add(pinToolbar);
                                }
                                pinsPanel.doLayout();
                            });
                        }
                    }
                }
               })
           ]
        });
        var myToolbar = new Ext.Toolbar({
            dock : 'top',
            title: 'FirmataTouch',
            items: [
                {
                    text: 'Choose USB Port'
                   ,handler: function(button,event){
                       now.getUSBPorts(function(ports){
                           portStore.removeAll();
                           portStore.add(ports);
                           usbPortsPanel.showBy(button.el,'fade');
                       });
                   }
                }
            ]
        });
        myPanel = new Ext.Panel({
            dockedItems: [myToolbar],
            fullscreen : true,
            layout:'fit',
            items:[pinsPanel]
        });
    }
});